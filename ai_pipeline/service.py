"""
Glue between the data source and the AI pipeline. No HTTP in here, no SQL in here.

- run_pipeline: plain data in, portfolio out. Use this directly if the user's data
  comes from somewhere other than our DB (e.g. the Node backend sends it in a request).
- generate_for_user: fetch the user's data through db.py, then run_pipeline.

To change *how data is fetched*, edit db.py only. The pipeline/ package is not touched.
"""
from pydantic import ValidationError

from db import fetch_user_re_data_sync
from pipeline.jd_extractor import extract_jd
from pipeline.skill_normalizer import normalize_skills, normalize_jd
from pipeline.scorer import score_and_rank
from pipeline.rewriter import rewrite_and_build_portfolio


class ProfileMismatch(Exception):
    """None of the user's resume entities fit the job description."""


def run_pipeline(user_profile: dict, user_entities: list, jd_text: str) -> dict:
    """Steps 1-4: extract JD -> normalize skills -> score and rank -> rewrite and assemble."""
    jd_data = normalize_jd(extract_jd(jd_text))
    normalized = normalize_skills(user_entities, jd_data)

    try:
        scored = score_and_rank(normalized, jd_data)
    except ValueError as e:
        # The scorer raises a plain ValueError when nothing fits the JD. pydantic's
        # ValidationError is also a ValueError, but that one is an LLM failure.
        if isinstance(e, ValidationError):
            raise
        raise ProfileMismatch(str(e)) from e

    return rewrite_and_build_portfolio(scored, jd_data, user_profile)


def generate_for_user(user_id: str, jd_text: str) -> dict:
    """Fetch the user's profile and resume entities via db.py, then run the pipeline."""
    user_profile, user_entities = fetch_user_re_data_sync(user_id)
    return run_pipeline(user_profile, user_entities, jd_text)
