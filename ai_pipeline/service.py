"""
Glue between the data source and the AI pipeline. No HTTP in here, no SQL in here.

- run_pipeline: plain data in, portfolio document and job role out. Use this directly if the
  user's data comes from somewhere other than our DB (e.g. the Node backend sends it in a request).
- generate_for_user: fetch the user's data through db.py, run_pipeline, save the result through db.py.

To change *how data is fetched or saved*, edit db.py only. The pipeline/ package is not touched.
"""
from pydantic import ValidationError

from db import fetch_user_re_data_sync, save_portfolio_sync
from pipeline.jd_extractor import extract_jd
from pipeline.portfolio_formatter import build_portfolio_document
from pipeline.skill_normalizer import normalize_skills, normalize_jd
from pipeline.scorer import score_and_rank
from pipeline.rewriter import rewrite_and_build_portfolio


class ProfileMismatch(Exception):
    """None of the user's resume entities fit the job description."""


def run_pipeline(user_profile: dict, user_entities: list, jd_text: str) -> tuple[dict, str]:
    """Extract JD -> normalize skills -> score and rank -> rewrite -> format. Returns (document, job role)."""
    jd_data = normalize_jd(extract_jd(jd_text))
    normalized = normalize_skills(user_entities)

    try:
        scored = score_and_rank(normalized, jd_data)
    except ValueError as e:
        # The scorer raises a plain ValueError when nothing fits the JD. pydantic's
        # ValidationError is also a ValueError, but that one is an LLM failure.
        if isinstance(e, ValidationError):
            raise
        raise ProfileMismatch(str(e)) from e

    rewritten = rewrite_and_build_portfolio(scored, jd_data, user_profile)
    return build_portfolio_document(scored, rewritten, user_profile), rewritten["jobRole"]


def generate_for_user(user_id: str, jd_text: str) -> dict:
    """Fetch the user's data via db.py, run the pipeline, save the document to the portfolio table."""
    user_profile, user_entities = fetch_user_re_data_sync(user_id)
    document, job_role = run_pipeline(user_profile, user_entities, jd_text)
    portfolio_id = save_portfolio_sync(user_id, job_role, document)
    return {"portfolio_id": portfolio_id, "portfolio_json": document}
