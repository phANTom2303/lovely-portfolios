import json
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator
from groq import Groq, BadRequestError

from config import GROQ_API_KEY, GROQ_MODEL

PROMPT_PATH = Path(__file__).resolve().parent.parent / "prompts" / "rewriting_prompt.txt"
MAX_ATTEMPTS = 3
INITIAL_BACKOFF_SECONDS = 1.0


# Pydantic Validation Models for Rewriter Output
class ValidatedEntity(BaseModel):
    reId: int
    title: str
    rewrittenDescription: str = Field(..., min_length=15)
    skills: List[str] = []
    links: List[Any] = []
    assets: List[Any] = []
    fromDate: Optional[str] = None
    toDate: Optional[str] = None

    @field_validator("rewrittenDescription")
    @classmethod
    def validate_description_not_blank(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("rewrittenDescription cannot be empty")
        return stripped


class ValidatedSection(BaseModel):
    reType: str
    sectionTitle: Optional[str] = None
    entities: List[ValidatedEntity] = Field(..., min_length=1)


class RewriterOutputSchema(BaseModel):
    sections: List[ValidatedSection] = Field(..., min_length=1)


def _get_groq_client():
    return Groq(api_key=GROQ_API_KEY, timeout=40.0, max_retries=2)


def rewrite_and_build_portfolio(
    scored_entities: list, jd_extraction: dict, user_profile: dict
) -> dict:
    """
    Step 4: LLM Content Rewriting and Portfolio Assembly.
    Takes selected top-K scored entities, rewrites their descriptions to highlight JD-relevant
    experience using strong action verbs, validates schema via Pydantic, and builds the full portfolio JSON.
    """
    if not scored_entities:
        return {
            "jobRole": jd_extraction.get("jobRole", "Software Engineer"),
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "profile": _build_profile_dict(user_profile, jd_extraction),
            "sections": [],
        }

    # Load prompt template
    with open(PROMPT_PATH, "r", encoding="utf-8") as f:
        prompt_template = f.read()

    # Entities representation for the LLM
    clean_entities = []
    for entity in scored_entities:
        clean_entities.append(
            {
                "reId": entity.get("reId"),
                "reType": entity.get("reType"),
                "title": entity.get("title"),
                "originalDescription": entity.get("description"),
                "skills": entity.get("normalizedSkills") or entity.get("originalSkills") or [],
                "fromDate": entity.get("fromDate"),
                "toDate": entity.get("toDate"),
                "links": entity.get("links", []),
                "assets": entity.get("assets", []),
            }
        )

    filled_prompt = (
        prompt_template
        .replace("{job_role}", str(jd_extraction.get("jobRole", "N/A")))
        .replace("{must_have_skills}", ", ".join(jd_extraction.get("mustHaveSkills", [])) or "None specified")
        .replace("{responsibilities}", "; ".join(jd_extraction.get("responsibilities", [])) or "None specified")
        .replace("{entities}", json.dumps(clean_entities, indent=2))
    )

    client = _get_groq_client()
    validated_data: Optional[RewriterOutputSchema] = None
    backoff = INITIAL_BACKOFF_SECONDS

    expected_ids = {e.get("reId") for e in scored_entities if e.get("reId") is not None}

    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            response = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a professional portfolio writer. Rewrite descriptions with active verbs and zero hallucination. Return strictly valid JSON.",
                    },
                    {"role": "user", "content": filled_prompt},
                ],
                temperature=0.0,
                response_format={"type": "json_object"},
            )
            raw_text = response.choices[0].message.content
            parsed_json = json.loads(raw_text)

            # Pydantic validation
            validated_data = RewriterOutputSchema.model_validate(parsed_json)

            # Check that all scored entity IDs are represented in the output
            output_ids = {
                entity.reId
                for section in validated_data.sections
                for entity in section.entities
            }

            if not expected_ids.issubset(output_ids):
                missing = expected_ids - output_ids
                print(f"[rewriter] Attempt {attempt}: Missing expected entity IDs {missing}")
                if attempt == MAX_ATTEMPTS:
                    # Best-effort merge if last attempt
                    break
                time.sleep(backoff)
                backoff *= 2
                continue

            break

        except json.JSONDecodeError as e:
            print(f"[rewriter] Attempt {attempt}: invalid JSON from model — {e}")
            if attempt == MAX_ATTEMPTS:
                raise RuntimeError(f"rewriter: no valid JSON after {MAX_ATTEMPTS} attempts")

        except BadRequestError as e:
            if "json_validate_failed" not in str(e):
                raise
            print(f"[rewriter] Attempt {attempt}: model failed JSON mode — {e}")
            if attempt == MAX_ATTEMPTS:
                raise RuntimeError(f"rewriter: failed JSON validation after {MAX_ATTEMPTS} attempts")

        except Exception as e:
            print(f"[rewriter] Attempt {attempt}: validation/request error — {e}")
            if attempt == MAX_ATTEMPTS:
                raise

        time.sleep(backoff)
        backoff *= 2

    if validated_data is None:
        raise RuntimeError("rewriter: Failed to generate a valid portfolio structure.")

    # Convert Pydantic sections to dict format
    sections_list = [section.model_dump() for section in validated_data.sections]

    portfolio = {
        "jobRole": jd_extraction.get("jobRole", "Software Engineer"),
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "profile": _build_profile_dict(user_profile, jd_extraction),
        "sections": sections_list,
    }

    return portfolio


def _build_profile_dict(user_profile: dict, jd_extraction: dict) -> dict:
    """Builds clean profile dictionary for the portfolio header."""
    return {
        "name": user_profile.get("name") or "Candidate",
        "professionalTitle": user_profile.get("professionalTitle")
        or user_profile.get("title")
        or jd_extraction.get("jobRole")
        or "Software Developer",
        "about": user_profile.get("about")
        or f"Passionate {jd_extraction.get('jobRole', 'software developer')} with practical project and engineering experience.",
        "currentLocation": user_profile.get("currentLocation")
        or user_profile.get("location")
        or "India",
        "socials": user_profile.get("socials") or {},
    }