import pytest
from pydantic import BaseModel, ValidationError

import service
from service import ProfileMismatch, generate_for_user, run_pipeline

PROFILE = {"name": "A"}
ENTITIES = [{"reId": 1, "originalSkills": ["JS"]}]


@pytest.fixture
def calls(monkeypatch):
    """Replace the four steps with fakes that record what they received, in call order."""
    log = []

    def extract(jd_text):
        log.append(("extract", jd_text))
        return {"jobRole": "Intern"}

    def norm_jd(jd):
        log.append(("normalize_jd", jd))
        return {**jd, "normalized": True}

    def norm_skills(entities, jd):
        log.append(("normalize_skills", entities, jd))
        return [{**e, "normalizedSkills": ["javascript"]} for e in entities]

    def score(entities, jd):
        log.append(("score", entities, jd))
        return entities

    def rewrite(scored, jd, profile):
        log.append(("rewrite", scored, jd, profile))
        return {"sections": []}

    monkeypatch.setattr(service, "extract_jd", extract)
    monkeypatch.setattr(service, "normalize_jd", norm_jd)
    monkeypatch.setattr(service, "normalize_skills", norm_skills)
    monkeypatch.setattr(service, "score_and_rank", score)
    monkeypatch.setattr(service, "rewrite_and_build_portfolio", rewrite)
    return log


def test_steps_run_in_order_and_feed_each_other(calls):
    result = run_pipeline(PROFILE, ENTITIES, "the jd")

    assert result == {"sections": []}
    assert [c[0] for c in calls] == ["extract", "normalize_jd", "normalize_skills", "score", "rewrite"]
    # the *normalized* JD reaches every later step, and the profile reaches the rewriter
    assert calls[2][2]["normalized"] and calls[3][2]["normalized"] and calls[4][2]["normalized"]
    assert calls[4][3] == PROFILE
    assert calls[4][1][0]["normalizedSkills"] == ["javascript"]


def test_scorer_value_error_becomes_profile_mismatch(calls, monkeypatch):
    def no_fit(entities, jd):
        raise ValueError("Profile does not match this Job Description")

    monkeypatch.setattr(service, "score_and_rank", no_fit)

    with pytest.raises(ProfileMismatch, match="does not match"):
        run_pipeline(PROFILE, ENTITIES, "jd")
    assert not any(c[0] == "rewrite" for c in calls)  # stopped before the rewriter


def test_scorer_validation_error_is_not_a_profile_mismatch(calls, monkeypatch):
    class M(BaseModel):
        x: int

    try:
        M.model_validate({"x": "nope"})
    except ValidationError as e:
        err = e

    def bad_llm_output(entities, jd):
        raise err

    monkeypatch.setattr(service, "score_and_rank", bad_llm_output)

    with pytest.raises(ValidationError):
        run_pipeline(PROFILE, ENTITIES, "jd")


def test_generate_for_user_fetches_then_runs(calls, monkeypatch):
    monkeypatch.setattr(service, "fetch_user_re_data_sync", lambda uid: (PROFILE, ENTITIES))

    assert generate_for_user("some-id", "the jd") == {"sections": []}
    assert calls[0] == ("extract", "the jd")
    assert calls[-1][3] == PROFILE
