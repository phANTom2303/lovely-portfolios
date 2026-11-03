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

    def norm_skills(entities):
        log.append(("normalize_skills", entities))
        return [{**e, "normalizedSkills": ["javascript"]} for e in entities]

    def score(entities, jd):
        log.append(("score", entities, jd))
        return entities

    def rewrite(scored, jd, profile):
        log.append(("rewrite", scored, jd, profile))
        return {"jobRole": "Intern", "sections": []}

    def build(scored, rewritten, profile):
        log.append(("format", scored, rewritten, profile))
        return {"sectionOrder": []}

    monkeypatch.setattr(service, "extract_jd", extract)
    monkeypatch.setattr(service, "normalize_jd", norm_jd)
    monkeypatch.setattr(service, "normalize_skills", norm_skills)
    monkeypatch.setattr(service, "score_and_rank", score)
    monkeypatch.setattr(service, "rewrite_and_build_portfolio", rewrite)
    monkeypatch.setattr(service, "build_portfolio_document", build)
    return log


def test_steps_run_in_order_and_feed_each_other(calls):
    result = run_pipeline(PROFILE, ENTITIES, "the jd")

    assert result == ({"sectionOrder": []}, "Intern")
    assert [c[0] for c in calls] == ["extract", "normalize_jd", "normalize_skills", "score", "rewrite", "format"]
    # the *normalized* JD reaches the scorer and the rewriter, and the profile reaches the rewriter
    assert calls[3][2]["normalized"] and calls[4][2]["normalized"]
    assert calls[4][3] == PROFILE
    assert calls[4][1][0]["normalizedSkills"] == ["javascript"]
    # the formatter gets the scored entities, the rewriter's result and the profile
    assert calls[5][2] == {"jobRole": "Intern", "sections": []}
    assert calls[5][1][0]["normalizedSkills"] == ["javascript"] and calls[5][3] == PROFILE


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


def test_generate_for_user_fetches_runs_and_saves(calls, monkeypatch):
    saved = []
    monkeypatch.setattr(service, "fetch_user_re_data_sync", lambda uid: (PROFILE, ENTITIES))
    monkeypatch.setattr(service, "save_portfolio_sync", lambda *args: saved.append(args) or 7)

    result = generate_for_user("some-id", "the jd")

    assert result == {"portfolio_id": 7, "portfolio_json": {"sectionOrder": []}}
    assert saved == [("some-id", "Intern", {"sectionOrder": []})]
    assert calls[0] == ("extract", "the jd")
    assert calls[-1][3] == PROFILE


def test_nothing_is_saved_when_the_pipeline_fails(calls, monkeypatch):
    saved = []
    def no_fit(entities, jd):
        raise ValueError("Profile does not match this Job Description")

    monkeypatch.setattr(service, "score_and_rank", no_fit)
    monkeypatch.setattr(service, "fetch_user_re_data_sync", lambda uid: (PROFILE, ENTITIES))
    monkeypatch.setattr(service, "save_portfolio_sync", lambda *args: saved.append(args) or 7)

    with pytest.raises(ProfileMismatch):
        generate_for_user("some-id", "the jd")
    assert saved == []
