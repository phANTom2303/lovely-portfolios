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
            "reasoning": "Direct match for Python/FastAPI",
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
