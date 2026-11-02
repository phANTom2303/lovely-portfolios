import json
from unittest.mock import patch, MagicMock
import pytest
from pipeline.rewriter import (
    rewrite_and_build_portfolio,
    ValidatedEntity,
    ValidatedSection,
    RewriterOutputSchema,
)


@pytest.fixture
def sample_jd():
    return {
        "jobRole": "Backend Developer Intern",
        "mustHaveSkills": ["python", "fastapi", "postgresql"],
        "responsibilities": ["build microservices", "write unit tests"],
    }


@pytest.fixture
def sample_user_profile():
    return {
        "name": "Anuranjan Singh",
        "professionalTitle": "Backend Engineer",
        "about": "Aspiring software engineer passionate about scalable backend systems.",
        "currentLocation": "Bhubaneswar",
        "socials": {"github": "https://github.com/anuranjan", "linkedin": "https://linkedin.com"},
    }


@pytest.fixture
def sample_scored_entities():
    return [
        {
            "reId": 2,
            "reType": "project",
            "title": "REST API for College ERP",
            "description": "Designed and built a REST API for college management system",
            "normalizedSkills": ["python", "fastapi", "postgresql"],
            "fromDate": "2024-06-01",
            "toDate": "2024-08-01",
            "score": 0.95,
        }
    ]


def test_rewrite_and_build_portfolio_success(sample_scored_entities, sample_jd, sample_user_profile):
    mock_llm_output = {
        "sections": [
            {
                "reType": "project",
                "sectionTitle": "Projects",
                "entities": [
                    {
                        "reId": 2,
                        "title": "REST API for College ERP",
                        "rewrittenDescription": "Architected and deployed a production-grade REST API utilizing FastAPI and PostgreSQL. Implemented clean architecture and modular microservices to optimize data throughput for over 500 students.",
                        "skills": ["python", "fastapi", "postgresql"],
                        "links": [],
                        "assets": [],
                        "fromDate": "2024-06-01",
                        "toDate": "2024-08-01",
                    }
                ],
            }
        ]
    }

    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(message=MagicMock(content=json.dumps(mock_llm_output)))
    ]

    with patch("pipeline.rewriter.Groq") as mock_groq:
        mock_groq.return_value.chat.completions.create.return_value = mock_response
        portfolio = rewrite_and_build_portfolio(sample_scored_entities, sample_jd, sample_user_profile)

        assert portfolio["jobRole"] == "Backend Developer Intern"
        assert "generatedAt" in portfolio
        assert portfolio["profile"]["name"] == "Anuranjan Singh"
        assert portfolio["profile"]["professionalTitle"] == "Backend Engineer"
        assert len(portfolio["sections"]) == 1
        assert portfolio["sections"][0]["reType"] == "project"

        entity = portfolio["sections"][0]["entities"][0]
        assert entity["reId"] == 2
        assert "Architected and deployed" in entity["rewrittenDescription"]
        assert entity["skills"] == ["python", "fastapi", "postgresql"]


def test_rewrite_empty_entities(sample_jd, sample_user_profile):
    portfolio = rewrite_and_build_portfolio([], sample_jd, sample_user_profile)
    assert portfolio["jobRole"] == "Backend Developer Intern"
    assert portfolio["sections"] == []
    assert portfolio["profile"]["name"] == "Anuranjan Singh"


def test_pydantic_validation_rejects_blank_description():
    with pytest.raises(Exception):
        ValidatedEntity(
            reId=1,
            title="Project",
            rewrittenDescription="   ",  # Blank should fail validation
            skills=["python"],
        )


def test_rewriter_retries_on_invalid_json(sample_scored_entities, sample_jd, sample_user_profile):
    valid_output = {
        "sections": [
            {
                "reType": "project",
                "sectionTitle": "Projects",
                "entities": [
                    {
                        "reId": 2,
                        "title": "REST API for College ERP",
                        "rewrittenDescription": "Engineered robust RESTful backend microservices in FastAPI with PostgreSQL.",
                        "skills": ["python", "fastapi", "postgresql"],
                    }
                ],
            }
        ]
    }

    bad_resp = MagicMock()
    bad_resp.choices = [MagicMock(message=MagicMock(content="MALFORMED_JSON"))]
    good_resp = MagicMock()
    good_resp.choices = [MagicMock(message=MagicMock(content=json.dumps(valid_output)))]

    with patch("pipeline.rewriter.Groq") as mock_groq:
        mock_groq.return_value.chat.completions.create.side_effect = [bad_resp, good_resp]
        with patch("time.sleep"):
            portfolio = rewrite_and_build_portfolio(sample_scored_entities, sample_jd, sample_user_profile)

        assert len(portfolio["sections"]) == 1
        assert portfolio["sections"][0]["entities"][0]["reId"] == 2


def test_rewriter_prompt_contains_guardrails_and_no_leakage():
    from pipeline.rewriter import PROMPT_PATH
    with open(PROMPT_PATH, "r", encoding="utf-8") as f:
        prompt_content = f.read()

    # Ensure no leaking specific project examples
    assert "Share Market Tracker" not in prompt_content
    assert "optimized database query latency for streaming financial data" not in prompt_content

    # Ensure strict guardrails are present
    assert "ZERO FABRICATION" in prompt_content
    assert "NO INVENTED ACTIONS OR OUTCOMES" in prompt_content
    assert "NEVER attribute JD responsibilities to candidate projects" in prompt_content



# --- subtitle, links and assets are copied from the database rows, never from the model ---

SOURCE_LINKS = [{"id": 7, "title": "Live Demo", "link": "https://demo.example.com", "description": "Live site"}]
SOURCE_ASSETS = [
    {"asset_id": 3, "title": "Home page", "link": "https://img.example.com/a.png",
     "description": "", "asset_type": "image"}
]


def _llm_response(entity_overrides=None):
    entity = {
        "reId": 2,
        "title": "REST API for College ERP",
        "rewrittenDescription": "Built a REST API for a college management system using FastAPI and PostgreSQL.",
        "skills": ["python", "fastapi", "postgresql"],
        "fromDate": "2024-06-01",
        "toDate": "2024-08-01",
    }
    entity.update(entity_overrides or {})
    payload = {"sections": [{"reType": "project", "sectionTitle": "Projects", "entities": [entity]}]}
    return MagicMock(choices=[MagicMock(message=MagicMock(content=json.dumps(payload)))])


def test_subtitle_links_and_assets_are_attached_from_the_source_entity(
    sample_scored_entities, sample_jd, sample_user_profile
):
    sample_scored_entities[0].update(subtitle="Academic Project", links=SOURCE_LINKS, assets=SOURCE_ASSETS)

    with patch("pipeline.rewriter.Groq") as mock_groq:
        mock_groq.return_value.chat.completions.create.return_value = _llm_response()
        portfolio = rewrite_and_build_portfolio(sample_scored_entities, sample_jd, sample_user_profile)

    entity = portfolio["sections"][0]["entities"][0]
    assert entity["subtitle"] == "Academic Project"
    assert entity["links"] == SOURCE_LINKS
    assert entity["assets"] == SOURCE_ASSETS


def test_model_cannot_change_or_invent_links_assets_or_subtitle(
    sample_scored_entities, sample_jd, sample_user_profile
):
    sample_scored_entities[0].update(subtitle="Academic Project", links=SOURCE_LINKS, assets=SOURCE_ASSETS)
    tampered = {
        "subtitle": "Google",
        "links": [{"title": "Fake", "link": "https://evil.example.com"}],
        "assets": [{"title": "Fake", "link": "https://evil.example.com/x.png"}],
    }

    with patch("pipeline.rewriter.Groq") as mock_groq:
        mock_groq.return_value.chat.completions.create.return_value = _llm_response(tampered)
        portfolio = rewrite_and_build_portfolio(sample_scored_entities, sample_jd, sample_user_profile)

    entity = portfolio["sections"][0]["entities"][0]
    assert entity["subtitle"] == "Academic Project"
    assert entity["links"] == SOURCE_LINKS
    assert entity["assets"] == SOURCE_ASSETS


def test_entity_without_subtitle_links_or_assets_gets_empty_defaults(
    sample_scored_entities, sample_jd, sample_user_profile
):
    with patch("pipeline.rewriter.Groq") as mock_groq:
        mock_groq.return_value.chat.completions.create.return_value = _llm_response()
        portfolio = rewrite_and_build_portfolio(sample_scored_entities, sample_jd, sample_user_profile)

    entity = portfolio["sections"][0]["entities"][0]
    assert entity["subtitle"] == ""
    assert entity["links"] == []
    assert entity["assets"] == []


def test_links_and_assets_are_not_sent_to_the_model(sample_scored_entities, sample_jd, sample_user_profile):
    sample_scored_entities[0].update(subtitle="Academic Project", links=SOURCE_LINKS, assets=SOURCE_ASSETS)

    with patch("pipeline.rewriter.Groq") as mock_groq:
        create = mock_groq.return_value.chat.completions.create
        create.return_value = _llm_response()
        rewrite_and_build_portfolio(sample_scored_entities, sample_jd, sample_user_profile)

    sent = json.dumps(create.call_args.kwargs["messages"])
    assert "demo.example.com" not in sent
    assert "img.example.com" not in sent


def test_prompt_does_not_ask_the_model_to_output_links_or_assets():
    from pipeline.rewriter import PROMPT_PATH
    with open(PROMPT_PATH, "r", encoding="utf-8") as f:
        prompt_content = f.read()
    assert '"links"' not in prompt_content
    assert '"assets"' not in prompt_content
