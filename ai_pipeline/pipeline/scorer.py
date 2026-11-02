import json
import time
from pathlib import Path
from typing import Any, Dict, List, Optional
from groq import Groq, BadRequestError

from config import GROQ_API_KEY, GROQ_MODEL

PROMPT_PATH = Path(__file__).resolve().parent.parent / "prompts" / "scoring_prompt.txt"
MAX_ATTEMPTS = 3
INITIAL_BACKOFF_SECONDS = 1.0
MIN_SCORE_THRESHOLD = 0.15
DEFAULT_BATCH_SIZE = 10

# Top-K limits per entity category
CATEGORY_CAPS = {
    "project": 3,
    "work_exp": 2,
    "certification": 2,
    "achievements": 2,
    "achievement": 2,  # alias for backwards compatibility
    "extra_curricular": 1,
    "others": 1,
}
DEFAULT_CAP = 2


def _get_groq_client():
    return Groq(api_key=GROQ_API_KEY, timeout=30.0, max_retries=2)


def _normalize_id(val: Any) -> Optional[str]:
    """
    Normalize entity ID to a stripped string for robust lookup across str/int types.
    Handles int, str, and float-string representations (e.g., 2, "2", "2.0", " 2 ").
    """
    if val is None:
        return None
    s = str(val).strip()
    try:
        f = float(s)
        if f.is_integer():
            return str(int(f))
    except (ValueError, TypeError):
        pass
    return s


def _extract_re_id(item: dict) -> Any:
    """Extract reId handling common field variations from LLM output."""
    if "reId" in item and item["reId"] is not None:
        return item["reId"]
    if "re_id" in item and item["re_id"] is not None:
        return item["re_id"]
    if "id" in item and item["id"] is not None:
        return item["id"]
    return None


def _score_batch(
    client: Groq,
    prompt_template: str,
    batch_entities: list,
    jd_extraction: dict,
) -> list:
    """Score a single chunk/batch of resume entities via the LLM with retry & backoff."""
    filled_prompt = (
        prompt_template
        .replace("{job_role}", str(jd_extraction.get("jobRole", "N/A")))
        .replace("{must_have_skills}", ", ".join(jd_extraction.get("mustHaveSkills", [])) or "None specified")
        .replace("{preferred_skills}", ", ".join(jd_extraction.get("preferredSkills", [])) or "None specified")
        .replace("{good_to_have_skills}", ", ".join(jd_extraction.get("goodToHaveSkills", [])) or "None specified")
        .replace("{responsibilities}", "; ".join(jd_extraction.get("responsibilities", [])) or "None specified")
        .replace("{domain_keywords}", ", ".join(jd_extraction.get("domainKeywords", [])) or "None specified")
        .replace("{experience_level}", str(jd_extraction.get("experienceLevel", "N/A")))
        .replace("{entities}", json.dumps(batch_entities, indent=2))
    )

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
            return raw_response.get("scored_entities", [])

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

    return []


def score_and_rank(
    normalized_entities: list,
    jd_extraction: dict,
    batch_size: int = DEFAULT_BATCH_SIZE,
) -> list:
    """
    Step 3: LLM Batch Scoring and Ranking.
    Scores normalized resume entities against the extracted JD in batches to avoid context overflow.
    Robustly matches entity IDs across str/int types, applies thresholding (< 0.15 discarded),
    and enforces per-category Top-K selection caps.
    """
    if not normalized_entities:
        raise ValueError("Profile does not match this Job Description")

    # Load scoring prompt template
    with open(PROMPT_PATH, "r", encoding="utf-8") as f:
        prompt_template = f.read()

    client = _get_groq_client()

    # Process in batches to prevent context window overflow or token truncation on large profiles
    scored_items = []
    effective_batch_size = max(1, batch_size)
    for i in range(0, len(normalized_entities), effective_batch_size):
        chunk = normalized_entities[i : i + effective_batch_size]
        items = _score_batch(client, prompt_template, chunk, jd_extraction)
        scored_items.extend(items)

    scores_by_id = {}
    for item in scored_items:
        raw_re_id = _extract_re_id(item)
        norm_id = _normalize_id(raw_re_id)
        if norm_id is not None:
            try:
                score_val = float(item.get("score", 0.0))
            except (ValueError, TypeError):
                score_val = 0.0
            # Bound score strictly to [0.0, 1.0]
            score_val = max(0.0, min(1.0, score_val))
            scores_by_id[norm_id] = {"score": score_val}

    # Merge scores back into entities and filter by threshold
    qualified_entities = []
    for entity in normalized_entities:
        raw_re_id = _extract_re_id(entity)
        norm_id = _normalize_id(raw_re_id)

        if norm_id is not None and norm_id in scores_by_id:
            score_data = scores_by_id[norm_id]
        else:
            print(f"[scorer] Warning: Entity ID {raw_re_id!r} not found in model scoring response.")
            score_data = {"score": 0.0}

        scored_entity = dict(entity)
        scored_entity["score"] = score_data["score"]

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