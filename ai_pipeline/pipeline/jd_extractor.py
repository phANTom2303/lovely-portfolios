import json
from pathlib import Path

from groq import Groq, BadRequestError
from pydantic import ValidationError

from config import GROQ_API_KEY, GROQ_MODEL
from pipeline.schemas import JDExtraction

PROMPT_PATH = Path(__file__).resolve().parent.parent / "prompts" / "extraction_prompt.txt"
MAX_JSON_ATTEMPTS = 3

# The SDK retries network errors, timeouts, 429 and 5xx on its own.
client = Groq(api_key=GROQ_API_KEY, timeout=30.0, max_retries=2)


def extract_jd(jd_text: str) -> dict:
    with open(PROMPT_PATH, "r") as f:
        system_prompt = f.read()

    user_message = f"Extract structured data from this job description:\n\n{jd_text}"

    # This loop only retries when the model's output isn't valid JSON or doesn't
    # match JDExtraction. Any other API error is raised straight to the caller.
    for attempt in range(1, MAX_JSON_ATTEMPTS + 1):
        try:
            response = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": user_message},
                ],
                temperature=0.0,
                response_format={"type": "json_object"},
            )
            raw = response.choices[0].message.content
            return JDExtraction.model_validate(json.loads(raw)).model_dump()

        except json.JSONDecodeError as e:
            print(f"[jd_extractor] Attempt {attempt}: invalid JSON from model — {e}")

        except ValidationError as e:
            print(f"[jd_extractor] Attempt {attempt}: JSON doesn't match JDExtraction — {e}")

        except BadRequestError as e:
            # Groq rejects output that fails JSON mode with a 400 "json_validate_failed".
            # Any other 400 means our request itself is wrong, so retrying won't help.
            if "json_validate_failed" not in str(e):
                raise
            print(f"[jd_extractor] Attempt {attempt}: model failed JSON mode — {e}")

    raise RuntimeError(f"jd_extractor: no valid JSON after {MAX_JSON_ATTEMPTS} attempts")
