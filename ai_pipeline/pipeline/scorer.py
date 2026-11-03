import json
import time
from pathlib import Path
from typing import Any, Dict, List, Optional
from groq import Groq, BadRequestError, RateLimitError

from config import GROQ_API_KEY, GROQ_MODEL
from pipeline.skill_normalizer import skill_match_keys

PROMPT_PATH = Path(__file__).resolve().parent.parent / "prompts" / "scoring_prompt.txt"
MAX_ATTEMPTS = 3
INITIAL_BACKOFF_SECONDS = 1.0
MIN_SCORE_THRESHOLD = 0.15
DEFAULT_BATCH_SIZE = 10

# Rate limits (429). The Groq SDK already retries twice using the server's retry-after hint; if it
# still fails, wait what the server asks for (or this fallback) instead of the 1s/2s JSON backoff.
RATE_LIMIT_FALLBACK_SECONDS = 10.0
MAX_RATE_LIMIT_WAIT_SECONDS = 60.0

# Ranking. The LLM score alone decides relevance (MIN_SCORE_THRESHOLD), so piling skills onto an
# unrelated entity cannot push it into the portfolio. The order inside a category uses
# rankScore = LLM_WEIGHT * llm score + (1 - LLM_WEIGHT) * skillScore, which damps the LLM's
# run-to-run wobble with a deterministic skill-overlap signal. skillScore is the weighted number
# of JD skills the entity has, divided by SKILL_SATURATION: three must-have matches count as full.
LLM_WEIGHT = 0.7
SKILL_TIER_WEIGHTS = {"mustHaveSkills": 1.0, "preferredSkills": 0.6, "goodToHaveSkills": 0.3}
SKILL_SATURATION = 3.0

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


def _scoring_view(entity: dict) -> dict:
    """
    Only the fields the LLM needs to judge relevance. Links, assets and the three copies of the
    skill list are left out: they were about half of each batch's tokens, and the Groq on-demand
    tier allows 8000 tokens per minute, so a full-size batch alone was close to the limit.
    """
    view = {
        "reId": _extract_re_id(entity),
        "reType": entity.get("reType"),
        "title": entity.get("title"),
        "subtitle": entity.get("subtitle"),
        "description": entity.get("description"),
        "skills": entity.get("displaySkills") or entity.get("originalSkills") or entity.get("normalizedSkills"),
        "fromDate": entity.get("fromDate"),
        "toDate": entity.get("toDate"),
    }
    return {k: v for k, v in view.items() if v not in (None, "", [])}


def _rate_limit_wait(error: RateLimitError, backoff: float) -> Optional[float]:
    """
    Seconds to wait after a 429: the server's retry-after if it sent one, else a safe fallback.
    None when the server asks for longer than MAX_RATE_LIMIT_WAIT_SECONDS: that is the daily
    token limit (TPD), which no retry inside this request can outlast, so the caller fails fast.
    """
    try:
        wait = float(error.response.headers.get("retry-after"))
    except (AttributeError, TypeError, ValueError):
        wait = 0.0
    if wait > MAX_RATE_LIMIT_WAIT_SECONDS:
        return None
    if wait <= 0:
        wait = max(backoff, RATE_LIMIT_FALLBACK_SECONDS)
    return wait


def _jd_skill_tiers(jd_extraction: dict) -> list:
    """[(match keys, weight)] for every JD skill. A skill listed in two tiers counts once, at its higher weight."""
    best: Dict[str, tuple] = {}
    for field, weight in SKILL_TIER_WEIGHTS.items():
        for skill in jd_extraction.get(field) or []:
            keys = skill_match_keys(skill)
            if not keys:
                continue
            name = min(keys)
            if name not in best or best[name][1] < weight:
                best[name] = (keys, weight)
    return list(best.values())


def _skill_score(entity: dict, jd_tiers: list) -> Optional[float]:
    """
    Weighted JD-skill overlap in [0, 1], or None when there is nothing to compare (the entity
    lists no skills, or the JD names none). None means "rank by the LLM score alone".
    """
    skills = entity.get("normalizedSkills") or entity.get("originalSkills") or []
    entity_keys = set()
    for skill in skills:
        entity_keys |= skill_match_keys(skill)
    if not entity_keys or not jd_tiers:
        return None
    matched = sum(weight for keys, weight in jd_tiers if keys & entity_keys)
    return round(min(1.0, matched / SKILL_SATURATION), 4)


def _rank_key(entity: dict) -> tuple:
    """Higher rankScore first; ties go to more skill overlap, then the more recent entity, then lower reId."""
    skill = entity.get("skillScore")
    re_id = _normalize_id(_extract_re_id(entity)) or ""
    return (
        -entity.get("rankScore", 0.0),
        -(skill if skill is not None else -1.0),
        _date_rank(entity.get("fromDate")),
        (len(re_id), re_id),
    )


def _date_rank(value: Any) -> int:
    """'2023-09-01' -> -20230901, so later dates sort first; a missing or odd date sorts last (0)."""
    try:
        return -int(str(value)[:10].replace("-", ""))
    except (TypeError, ValueError):
        return 0


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
        .replace(
            "{entities}",
            json.dumps([_scoring_view(e) for e in batch_entities], ensure_ascii=False, separators=(",", ":")),
        )
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

        except RateLimitError as e:
            wait = _rate_limit_wait(e, backoff)
            if attempt == MAX_ATTEMPTS or wait is None:
                raise
            print(f"[scorer] Attempt {attempt}: rate limited (429), waiting {wait:.1f}s")
            time.sleep(wait)
            backoff *= 2
            continue

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
    Robustly matches entity IDs across str/int types, applies thresholding (LLM score < 0.15
    discarded), and enforces per-category Top-K selection caps.
    Each returned entity carries: score (LLM), skillScore (JD skill overlap, or None) and
    rankScore (the blend used for ordering). Ordering is deterministic for equal scores.
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
    jd_tiers = _jd_skill_tiers(jd_extraction)
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
        skill = _skill_score(entity, jd_tiers)
        scored_entity["skillScore"] = skill
        scored_entity["rankScore"] = (
            score_data["score"] if skill is None
            else round(LLM_WEIGHT * score_data["score"] + (1 - LLM_WEIGHT) * skill, 4)
        )

        # Relevance gate on the LLM score only (see LLM_WEIGHT above).
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
        entity_list.sort(key=_rank_key)
        cap = CATEGORY_CAPS.get(re_type, DEFAULT_CAP)
        final_selected.extend(entity_list[:cap])

    final_selected.sort(key=_rank_key)
    return final_selected
