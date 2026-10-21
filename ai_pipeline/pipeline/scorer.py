import json
import time
from pathlib import Path
from groq import Groq, BadRequestError

from config import GROQ_API_KEY, GROQ_MODEL

PROMPT_PATH = Path(__file__).resolve().parent.parent / "prompts" / "scoring_prompt.txt"
MAX_ATTEMPTS = 3
INITIAL_BACKOFF_SECONDS = 1.0
MIN_SCORE_THRESHOLD = 0.15

# Top-K limits per entity category
CATEGORY_CAPS = {
    "project": 3,
    "work_exp": 2,
    "certification": 2,
    "achievement": 2,
    "extra_curricular": 1,
}
DEFAULT_CAP = 2


def _get_groq_client():
    return Groq(api_key=GROQ_API_KEY, timeout=30.0, max_retries=2)


def score_and_rank(normalized_entities: list, jd_extraction: dict) -> list:
    """
    Step 3: LLM Batch Scoring and Ranking.
    Scores ALL normalized resume entities against the extracted JD in a single batch LLM call.
    Applies score thresholding (< 0.15 discarded) and per-category Top-K selection caps.
    """
    if not normalized_entities:
        raise ValueError("Profile does not match this Job Description")

    # Load scoring prompt template
    with open(PROMPT_PATH, "r", encoding="utf-8") as f:
        prompt_template = f.read()

    # Format prompt variables safely without breaking on JSON braces
    filled_prompt = (
        prompt_template
        .replace("{job_role}", str(jd_extraction.get("jobRole", "N/A")))
        .replace("{must_have_skills}", ", ".join(jd_extraction.get("mustHaveSkills", [])) or "None specified")
        .replace("{preferred_skills}", ", ".join(jd_extraction.get("preferredSkills", [])) or "None specified")
        .replace("{good_to_have_skills}", ", ".join(jd_extraction.get("goodToHaveSkills", [])) or "None specified")
        .replace("{responsibilities}", "; ".join(jd_extraction.get("responsibilities", [])) or "None specified")
        .replace("{domain_keywords}", ", ".join(jd_extraction.get("domainKeywords", [])) or "None specified")
        .replace("{experience_level}", str(jd_extraction.get("experienceLevel", "N/A")))
        .replace("{entities}", json.dumps(normalized_entities, indent=2))
    )

    client = _get_groq_client()
    raw_response = None
    backoff = INITIAL_BACKOFF_SECONDS

    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            response = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert technical recruiter evaluating candidate entities against a job description. Output strictly valid JSON.",
                    },
                    {"role": "user", "content": filled_prompt},
                ],
                temperature=0.0,
                response_format={"type": "json_object"},
            )
            content = response.choices[0].message.content
            raw_response = json.loads(content)
            break

        except json.JSONDecodeError as e:
            print(f"[scorer] Attempt {attempt}: invalid JSON from model — {e}")
            if attempt == MAX_ATTEMPTS:
                raise RuntimeError(f"scorer: no valid JSON after {MAX_ATTEMPTS} attempts")

        except BadRequestError as e:
            if "json_validate_failed" not in str(e):
                raise
            print(f"[scorer] Attempt {attempt}: model failed JSON mode — {e}")
            if attempt == MAX_ATTEMPTS:
                raise RuntimeError(f"scorer: failed JSON validation after {MAX_ATTEMPTS} attempts")

        except Exception as e:
            print(f"[scorer] Attempt {attempt}: request error — {e}")
            if attempt == MAX_ATTEMPTS:
                raise

        time.sleep(backoff)
        backoff *= 2

    scored_items = raw_response.get("scored_entities", [])
    scores_by_id = {}
    for item in scored_items:
        re_id = item.get("reId")
        if re_id is not None:
            try:
                score_val = float(item.get("score", 0.0))
            except (ValueError, TypeError):
                score_val = 0.0
            # Bound score strictly to [0.0, 1.0]
            score_val = max(0.0, min(1.0, score_val))
            scores_by_id[re_id] = {
                "score": score_val,
                "reasoning": item.get("reasoning", "Relevant match for target role"),
            }

    # Merge scores back into entities and filter by threshold
    qualified_entities = []
    for entity in normalized_entities:
        re_id = entity.get("reId")
        score_data = scores_by_id.get(
            re_id,
            {"score": 0.0, "reasoning": "Unmatched entity"},
        )
        scored_entity = dict(entity)
        scored_entity["score"] = score_data["score"]
        scored_entity["reasoning"] = score_data["reasoning"]

        if scored_entity["score"] >= MIN_SCORE_THRESHOLD:
            qualified_entities.append(scored_entity)

    # Discard check: if no entity scores above 0.15, raise error
    if not qualified_entities:
        raise ValueError("Profile does not match this Job Description")

    # Group by reType and apply Top-K caps
    grouped_by_type = {}
    for entity in qualified_entities:
        re_type = entity.get("reType", "project")
        grouped_by_type.setdefault(re_type, []).append(entity)

    final_selected = []
    for re_type, entity_list in grouped_by_type.items():
        # Sort descending by score
        entity_list.sort(key=lambda x: x.get("score", 0.0), reverse=True)
        cap = CATEGORY_CAPS.get(re_type, DEFAULT_CAP)
        final_selected.extend(entity_list[:cap])

    # Final overall sort by score descending
    final_selected.sort(key=lambda x: x.get("score", 0.0), reverse=True)
    return final_selected