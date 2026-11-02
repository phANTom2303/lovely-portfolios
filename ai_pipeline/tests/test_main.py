import httpx
import pytest
from fastapi.testclient import TestClient
from groq import APIConnectionError
from pydantic import BaseModel, ValidationError

import main
from db import NoResumeEntities, UserNotFound
from service import ProfileMismatch

USER_ID = "11111111-1111-1111-1111-111111111111"
BODY = {"user_id": USER_ID, "jd_text": "Backend intern, Python"}


@pytest.fixture
def client():
    return TestClient(main.app, raise_server_exceptions=False)


def make_fail(exc):
    def fail(*args, **kwargs):
        raise exc
    return fail


def post(client, body=BODY):
    return client.post("/api/generate-portfolio", json=body)


def test_success_returns_portfolio(client, monkeypatch):
    monkeypatch.setattr(main, "generate_for_user", lambda uid, jd: {"sections": []})

    response = post(client)

    assert response.status_code == 200
    assert response.json() == {"portfolio_json": {"sections": []}}


def test_user_id_and_jd_are_passed_through(client, monkeypatch):
    calls = []
    monkeypatch.setattr(main, "generate_for_user", lambda uid, jd: calls.append((uid, jd)) or {})

    post(client)

    assert calls == [(USER_ID, BODY["jd_text"])]


# --- caller mistakes (4xx) ------------------------------------------------

@pytest.mark.parametrize("jd_text", ["", "   \n"])
def test_blank_jd_is_400(client, jd_text):
    assert post(client, {**BODY, "jd_text": jd_text}).status_code == 400


def test_non_uuid_user_id_is_400(client):
    # Uses the real db layer: the id is rejected before any connection is made.
    response = post(client, {**BODY, "user_id": "abc"})

    assert response.status_code == 400
    assert "UUID" in response.json()["detail"]


def test_unknown_user_is_404(client, monkeypatch):
    monkeypatch.setattr(main, "generate_for_user", make_fail(UserNotFound("User not found")))
    assert post(client).status_code == 404


def test_user_without_entities_is_422(client, monkeypatch):
    monkeypatch.setattr(main, "generate_for_user", make_fail(NoResumeEntities("no entities")))
    assert post(client).status_code == 422


def test_profile_not_matching_jd_is_422(client, monkeypatch):
    monkeypatch.setattr(main, "generate_for_user", make_fail(ProfileMismatch("does not match")))

    response = post(client)

    assert response.status_code == 422
    assert "does not match" in response.json()["detail"]


def test_missing_field_is_rejected_by_fastapi(client):
    assert client.post("/api/generate-portfolio", json={"user_id": USER_ID}).status_code == 422


# --- LLM provider failures (502) ------------------------------------------

def test_groq_api_error_is_502(client, monkeypatch):
    request = httpx.Request("POST", "https://api.groq.com/openai/v1/chat/completions")
    monkeypatch.setattr(main, "generate_for_user", make_fail(APIConnectionError(request=request)))
    assert post(client).status_code == 502


def test_llm_gave_up_is_502(client, monkeypatch):
    monkeypatch.setattr(main, "generate_for_user", make_fail(RuntimeError("no valid JSON after 3 attempts")))
    assert post(client).status_code == 502


def test_llm_validation_error_is_502(client, monkeypatch):
    class M(BaseModel):
        x: int

    try:
        M.model_validate({"x": "not a number"})
    except ValidationError as e:
        err = e
    monkeypatch.setattr(main, "generate_for_user", make_fail(err))

    assert post(client).status_code == 502


# --- our own bugs (500) ---------------------------------------------------

def test_unexpected_error_is_500_without_leaking_details(client, monkeypatch):
    err = Exception('permission denied for table "users"')
    monkeypatch.setattr(main, "generate_for_user", make_fail(err))

    response = post(client)

    assert response.status_code == 500
    assert "users" not in response.json()["detail"]


# --- database unreachable (503) -------------------------------------------

def test_database_unavailable_is_503_without_leaking_details(client, monkeypatch):
    import db
    monkeypatch.setattr(
        main, "generate_for_user",
        make_fail(db.DatabaseUnavailable('password authentication failed for user "lovely_user"')),
    )

    response = post(client)

    assert response.status_code == 503
    detail = response.json()["detail"]
    assert "database" in detail.lower()
    assert "lovely_user" not in detail and "password" not in detail


def test_unreachable_database_through_the_real_db_layer_is_503_not_fake_data(client, monkeypatch):
    # nothing is faked except the TCP connect itself: the whole real path runs
    import db

    async def refused(*args, **kwargs):
        raise ConnectionRefusedError(111, "Connect call failed")

    monkeypatch.setattr(db.asyncpg, "connect", refused)

    response = post(client)

    assert response.status_code == 503
    assert "portfolio_json" not in response.json()
