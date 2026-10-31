import httpx
import pytest
from fastapi.testclient import TestClient
from groq import APIConnectionError

import main
from db import NoResumeEntities, UserNotFound

USER_ID = "11111111-1111-1111-1111-111111111111"
BODY = {"user_id": USER_ID, "jd_text": "Backend intern, Python"}


@pytest.fixture
def client():
    return TestClient(main.app, raise_server_exceptions=False)


@pytest.fixture
def happy_pipeline(monkeypatch):
    """Every step succeeds with canned data; tests override one step to make it fail."""
    monkeypatch.setattr(main, "fetch_user_re_data_sync", lambda uid: ({"name": "A"}, [{"reId": 1}]))
    monkeypatch.setattr(main, "extract_jd", lambda text: {"jobRole": "Intern"})
    monkeypatch.setattr(main, "normalize_jd", lambda jd: jd)
    monkeypatch.setattr(main, "normalize_skills", lambda entities, jd: entities)
    monkeypatch.setattr(main, "score_and_rank", lambda entities, jd: entities)
    monkeypatch.setattr(main, "rewrite_and_build_portfolio", lambda s, jd, p: {"sections": []})


def make_fail(exc):
    def fail(*args, **kwargs):
        raise exc
    return fail


def test_success_returns_portfolio(client, happy_pipeline):
    response = client.post("/api/generate-portfolio", json=BODY)

    assert response.status_code == 200
    assert response.json() == {"portfolio_json": {"sections": []}}


# --- caller mistakes (4xx) ------------------------------------------------

@pytest.mark.parametrize("jd_text", ["", "   \n"])
def test_blank_jd_is_400(client, happy_pipeline, jd_text):
    response = client.post("/api/generate-portfolio", json={**BODY, "jd_text": jd_text})
    assert response.status_code == 400


def test_non_uuid_user_id_is_400(client):
    # Uses the real db layer: the id is rejected before any connection is made.
    response = client.post("/api/generate-portfolio", json={**BODY, "user_id": "abc"})

    assert response.status_code == 400
    assert "UUID" in response.json()["detail"]


def test_unknown_user_is_404(client, happy_pipeline, monkeypatch):
    monkeypatch.setattr(main, "fetch_user_re_data_sync", make_fail(UserNotFound("User not found")))
    assert client.post("/api/generate-portfolio", json=BODY).status_code == 404


def test_user_without_entities_is_422(client, happy_pipeline, monkeypatch):
    monkeypatch.setattr(main, "fetch_user_re_data_sync", make_fail(NoResumeEntities("no entities")))
    assert client.post("/api/generate-portfolio", json=BODY).status_code == 422


def test_profile_not_matching_jd_is_422(client, happy_pipeline, monkeypatch):
    err = ValueError("Profile does not match this Job Description")
    monkeypatch.setattr(main, "score_and_rank", make_fail(err))

    response = client.post("/api/generate-portfolio", json=BODY)

    assert response.status_code == 422
    assert "does not match" in response.json()["detail"]


def test_missing_field_is_rejected_by_fastapi(client):
    assert client.post("/api/generate-portfolio", json={"user_id": USER_ID}).status_code == 422


# --- LLM provider failures (502) ------------------------------------------

def test_groq_api_error_is_502(client, happy_pipeline, monkeypatch):
    request = httpx.Request("POST", "https://api.groq.com/openai/v1/chat/completions")
    monkeypatch.setattr(main, "extract_jd", make_fail(APIConnectionError(request=request)))
    assert client.post("/api/generate-portfolio", json=BODY).status_code == 502


def test_llm_gave_up_is_502(client, happy_pipeline, monkeypatch):
    monkeypatch.setattr(main, "extract_jd", make_fail(RuntimeError("no valid JSON after 3 attempts")))
    assert client.post("/api/generate-portfolio", json=BODY).status_code == 502


def test_scorer_llm_validation_error_is_502_not_422(client, happy_pipeline, monkeypatch):
    # pydantic's ValidationError is a ValueError; it must not be mistaken for "profile mismatch".
    from pydantic import BaseModel, ValidationError

    class M(BaseModel):
        x: int

    try:
        M.model_validate({"x": "not a number"})
    except ValidationError as e:
        err = e
    monkeypatch.setattr(main, "score_and_rank", make_fail(err))

    assert client.post("/api/generate-portfolio", json=BODY).status_code == 502


# --- our own bugs (500) ---------------------------------------------------

def test_unexpected_error_is_500_without_leaking_details(client, happy_pipeline, monkeypatch):
    err = Exception('permission denied for table "users"')
    monkeypatch.setattr(main, "fetch_user_re_data_sync", make_fail(err))

    response = client.post("/api/generate-portfolio", json=BODY)

    assert response.status_code == 500
    assert "users" not in response.json()["detail"]
