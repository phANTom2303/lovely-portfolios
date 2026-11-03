import json
from types import SimpleNamespace
from unittest.mock import MagicMock

import httpx
import pytest
from groq import BadRequestError, InternalServerError

from pipeline import jd_extractor
from pipeline.jd_extractor import MAX_JSON_ATTEMPTS, extract_jd

VALID_JD = {
    "jobRole": "Backend Intern",
    "mustHaveSkills": ["Python", "Postgres"],
    "preferredSkills": ["Docker"],
    "goodToHaveSkills": [],
    "responsibilities": ["Build REST APIs"],
    "domainKeywords": ["fintech"],
    "experienceLevel": "fresher",
}


def llm_reply(content: str):
    """Shape of what client.chat.completions.create returns: .choices[0].message.content"""
    return SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=content))])


def bad_request(message: str) -> BadRequestError:
    request = httpx.Request("POST", "https://api.groq.com/openai/v1/chat/completions")
    response = httpx.Response(400, request=request)
    return BadRequestError(message, response=response, body=None)


@pytest.fixture
def create(monkeypatch):
    """Replace the real Groq client with a mock; tests set .side_effect to script replies."""
    fake_client = MagicMock()
    monkeypatch.setattr(jd_extractor, "client", fake_client)
    return fake_client.chat.completions.create


# --- happy path -----------------------------------------------------------

def test_valid_reply_is_returned_as_dict(create):
    create.side_effect = [llm_reply(json.dumps(VALID_JD))]

    assert extract_jd("some jd") == VALID_JD
    assert create.call_count == 1


def test_missing_optional_fields_get_defaults(create):
    create.side_effect = [llm_reply(json.dumps({"jobRole": "Intern"}))]

    result = extract_jd("some jd")

    assert result["jobRole"] == "Intern"
    assert result["mustHaveSkills"] == []
    assert result["experienceLevel"] == ""


def test_request_is_built_as_expected(create):
    create.side_effect = [llm_reply(json.dumps(VALID_JD))]

    extract_jd("We need a Python dev")

    kwargs = create.call_args.kwargs
    assert kwargs["model"] == jd_extractor.GROQ_MODEL
    assert kwargs["temperature"] == 0.0
    assert kwargs["response_format"] == {"type": "json_object"}
    system, user = kwargs["messages"]
    assert system["role"] == "system" and system["content"].strip()
    assert user["role"] == "user" and "We need a Python dev" in user["content"]


# --- retries on bad output ------------------------------------------------

def test_invalid_json_is_retried(create):
    create.side_effect = [llm_reply("not json {"), llm_reply(json.dumps(VALID_JD))]

    assert extract_jd("jd") == VALID_JD
    assert create.call_count == 2


def test_schema_mismatch_is_retried(create):
    no_role = {k: v for k, v in VALID_JD.items() if k != "jobRole"}
    create.side_effect = [llm_reply(json.dumps(no_role)), llm_reply(json.dumps(VALID_JD))]

    assert extract_jd("jd") == VALID_JD
    assert create.call_count == 2


def test_unknown_experience_level_is_retried(create):
    wrong_level = {**VALID_JD, "experienceLevel": "wizard"}
    create.side_effect = [llm_reply(json.dumps(wrong_level)), llm_reply(json.dumps(VALID_JD))]

    assert extract_jd("jd") == VALID_JD
    assert create.call_count == 2


def test_json_mode_rejection_is_retried(create):
    create.side_effect = [
        bad_request("Error code: 400 - json_validate_failed"),
        llm_reply(json.dumps(VALID_JD)),
    ]

    assert extract_jd("jd") == VALID_JD
    assert create.call_count == 2


def test_gives_up_after_max_attempts(create):
    create.side_effect = [llm_reply("garbage")] * MAX_JSON_ATTEMPTS

    with pytest.raises(RuntimeError, match="no valid JSON"):
        extract_jd("jd")
    assert create.call_count == MAX_JSON_ATTEMPTS


# --- errors that must NOT be retried here ---------------------------------

def test_other_bad_request_is_raised_immediately(create):
    create.side_effect = [bad_request("Error code: 400 - model_decommissioned")]

    with pytest.raises(BadRequestError):
        extract_jd("jd")
    assert create.call_count == 1


def test_other_api_errors_are_not_swallowed(create):
    request = httpx.Request("POST", "https://api.groq.com/openai/v1/chat/completions")
    create.side_effect = InternalServerError(
        "boom", response=httpx.Response(500, request=request), body=None
    )

    with pytest.raises(InternalServerError):
        extract_jd("jd")
    assert create.call_count == 1
