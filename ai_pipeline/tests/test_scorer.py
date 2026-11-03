import pytest
from unittest.mock import patch, MagicMock
from pipeline.scorer import score_and_rank


@pytest.fixture
def sample_jd():
    return {
        "jobRole": "Backend Developer Intern",
        "mustHaveSkills": ["python", "fastapi", "postgresql"],
        "preferredSkills": ["docker", "redis"],
        "goodToHaveSkills": ["aws"],
        "responsibilities": ["build microservices", "write unit tests"],
        "domainKeywords": ["backend", "api", "database"],
        "experienceLevel": "fresher",
    }


@pytest.fixture
def sample_entities():
    return [
        {
            "reId": 1,
            "reType": "project",
            "title": "Share Market Tracker",
            "description": "Built a real time stock price tracker with live data feeds",
            "normalizedSkills": ["javascript", "nodejs", "postgresql"],
            "fromDate": "2024-01-01",
            "toDate": "2024-05-01",
        },
        {
            "reId": 2,
            "reType": "project",
            "title": "REST API for College ERP",
            "description": "Designed and built a REST API for college management system",
            "normalizedSkills": ["python", "fastapi", "postgresql"],
            "fromDate": "2024-06-01",
            "toDate": "2024-08-01",
        },
        {
            "reId": 3,
            "reType": "work_exp",
            "title": "Backend Intern at Startup",
            "description": "Worked on Node.js microservices and REST APIs",
            "normalizedSkills": ["nodejs", "rest apis", "redis"],
            "fromDate": "2023-06-01",
            "toDate": "2023-08-01",
        },
    ]


def test_score_and_rank_success(sample_entities, sample_jd):
    mock_llm_output = {
        "scored_entities": [
            {"reId": 2, "score": 0.95},
            {"reId": 3, "score": 0.78},
            {"reId": 1, "score": 0.45},
        ]
    }

    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(message=MagicMock(content=__import__("json").dumps(mock_llm_output)))
    ]

    with patch("pipeline.scorer.Groq") as mock_groq:
        mock_groq.return_value.chat.completions.create.return_value = mock_response
        ranked = score_and_rank(sample_entities, sample_jd)

        assert len(ranked) == 3
        # Ensure ranked by score descending
        assert ranked[0]["reId"] == 2
        assert ranked[0]["score"] == 0.95
        assert ranked[1]["reId"] == 3
        assert ranked[1]["score"] == 0.78
        assert ranked[2]["reId"] == 1
        assert ranked[2]["score"] == 0.45


def test_score_and_rank_filters_below_threshold(sample_entities, sample_jd):
    mock_llm_output = {
        "scored_entities": [
            {"reId": 2, "score": 0.90},
            {"reId": 1, "score": 0.10},
            {"reId": 3, "score": 0.05},
        ]
    }

    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(message=MagicMock(content=__import__("json").dumps(mock_llm_output)))
    ]

    with patch("pipeline.scorer.Groq") as mock_groq:
        mock_groq.return_value.chat.completions.create.return_value = mock_response
        ranked = score_and_rank(sample_entities, sample_jd)

        # Entities 1 and 3 should be dropped
        assert len(ranked) == 1
        assert ranked[0]["reId"] == 2
        assert ranked[0]["score"] == 0.90


def test_score_and_rank_no_entity_clears_threshold_raises(sample_entities, sample_jd):
    mock_llm_output = {
        "scored_entities": [
            {"reId": 1, "score": 0.12},
            {"reId": 2, "score": 0.08},
            {"reId": 3, "score": 0.05},
        ]
    }

    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(message=MagicMock(content=__import__("json").dumps(mock_llm_output)))
    ]

    with patch("pipeline.scorer.Groq") as mock_groq:
        mock_groq.return_value.chat.completions.create.return_value = mock_response
        with pytest.raises(ValueError, match="Profile does not match this Job Description"):
            score_and_rank(sample_entities, sample_jd)


def test_score_and_rank_empty_entities_raises(sample_jd):
    with pytest.raises(ValueError, match="Profile does not match this Job Description"):
        score_and_rank([], sample_jd)


def test_score_and_rank_category_caps(sample_jd):
    # Create 5 projects and 4 work_exp entities
    many_entities = []
    scores_list = []
    for i in range(1, 6):
        many_entities.append(
            {
                "reId": i,
                "reType": "project",
                "title": f"Project {i}",
                "description": "A project description",
                "normalizedSkills": ["python"],
            }
        )
        scores_list.append({"reId": i, "score": 0.50 + i * 0.08})

    for j in range(6, 10):
        many_entities.append(
            {
                "reId": j,
                "reType": "work_exp",
                "title": f"Work Exp {j}",
                "description": "A work exp description",
                "normalizedSkills": ["fastapi"],
            }
        )
        scores_list.append({"reId": j, "score": 0.40 + j * 0.05})

    mock_llm_output = {"scored_entities": scores_list}
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(message=MagicMock(content=__import__("json").dumps(mock_llm_output)))
    ]

    with patch("pipeline.scorer.Groq") as mock_groq:
        mock_groq.return_value.chat.completions.create.return_value = mock_response
        ranked = score_and_rank(many_entities, sample_jd)

        # Projects capped at 3, work_exp capped at 2 -> Total 5
        projects = [e for e in ranked if e["reType"] == "project"]
        work_exps = [e for e in ranked if e["reType"] == "work_exp"]

        assert len(projects) == 3
        assert len(work_exps) == 2
        assert len(ranked) == 5
        # Top 3 projects by score should be 5, 4, 3
        assert [p["reId"] for p in projects] == [5, 4, 3]


def test_score_and_rank_retry_on_bad_json(sample_entities, sample_jd):
    valid_output = {
        "scored_entities": [
            {"reId": 1, "score": 0.60},
            {"reId": 2, "score": 0.85},
            {"reId": 3, "score": 0.70},
        ]
    }

    bad_response = MagicMock()
    bad_response.choices = [MagicMock(message=MagicMock(content="INVALID_JSON_STRING"))]

    good_response = MagicMock()
    good_response.choices = [
        MagicMock(message=MagicMock(content=__import__("json").dumps(valid_output)))
    ]

    with patch("pipeline.scorer.Groq") as mock_groq:
        # First attempt returns invalid JSON, second attempt returns good JSON
        mock_groq.return_value.chat.completions.create.side_effect = [
            bad_response,
            good_response,
        ]
        with patch("time.sleep"):  # Avoid delay in tests
            ranked = score_and_rank(sample_entities, sample_jd)

        assert len(ranked) == 3
        assert ranked[0]["reId"] == 2


def test_score_and_rank_string_reid_matching(sample_jd):
    """Ensure that if the LLM returns reId as a string ('2'), it matches int reId (2) correctly."""
    entities = [
        {
            "reId": 2,
            "reType": "project",
            "title": "REST API for College ERP",
            "normalizedSkills": ["python", "fastapi"],
        }
    ]
    mock_llm_output = {
        "scored_entities": [
            {"reId": "2", "score": 0.92}
        ]
    }
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(message=MagicMock(content=__import__("json").dumps(mock_llm_output)))
    ]

    with patch("pipeline.scorer.Groq") as mock_groq:
        mock_groq.return_value.chat.completions.create.return_value = mock_response
        ranked = score_and_rank(entities, sample_jd)

        assert len(ranked) == 1
        assert ranked[0]["reId"] == 2
        assert ranked[0]["score"] == 0.92


def test_score_and_rank_whitespace_and_float_string_reid(sample_jd):
    """Ensure robust ID matching across whitespace and float formatted string IDs."""
    entities = [
        {
            "reId": 10,
            "reType": "project",
            "title": "Project A",
            "normalizedSkills": ["python"],
        },
        {
            "reId": 20,
            "reType": "work_exp",
            "title": "Work B",
            "normalizedSkills": ["fastapi"],
        },
    ]
    mock_llm_output = {
        "scored_entities": [
            {"reId": " 10 ", "score": 0.88},
            {"reId": "20.0", "score": 0.75},
        ]
    }
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(message=MagicMock(content=__import__("json").dumps(mock_llm_output)))
    ]

    with patch("pipeline.scorer.Groq") as mock_groq:
        mock_groq.return_value.chat.completions.create.return_value = mock_response
        ranked = score_and_rank(entities, sample_jd)

        assert len(ranked) == 2
        assert ranked[0]["reId"] == 10
        assert ranked[0]["score"] == 0.88
        assert ranked[1]["reId"] == 20
        assert ranked[1]["score"] == 0.75


def test_score_and_rank_alternative_field_names(sample_jd):
    """Ensure model returning 're_id' or 'id' still matches properly."""
    entities = [
        {
            "reId": 1,
            "reType": "project",
            "title": "Project One",
            "normalizedSkills": ["python"],
        },
        {
            "reId": 2,
            "reType": "project",
            "title": "Project Two",
            "normalizedSkills": ["docker"],
        },
    ]
    mock_llm_output = {
        "scored_entities": [
            {"re_id": 1, "score": 0.80},
            {"id": "2", "score": 0.85},
        ]
    }
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(message=MagicMock(content=__import__("json").dumps(mock_llm_output)))
    ]

    with patch("pipeline.scorer.Groq") as mock_groq:
        mock_groq.return_value.chat.completions.create.return_value = mock_response
        ranked = score_and_rank(entities, sample_jd)

        # This test is about matching 're_id' / 'id'; order is covered by the ranking tests.
        assert len(ranked) == 2
        by_id = {e["reId"]: e["score"] for e in ranked}
        assert by_id == {1: 0.80, 2: 0.85}


def test_score_and_rank_batching_large_profile(sample_jd):
    """Ensure large profiles (e.g. 25 entities) are processed in batches without overflowing context."""
    large_entities = []
    for i in range(1, 26):
        large_entities.append(
            {
                "reId": i,
                "reType": "project" if i <= 15 else "work_exp",
                "title": f"Entity {i}",
                "description": f"Description for entity {i}",
                "normalizedSkills": ["python"],
            }
        )

    # Let's say batch_size=10. 25 entities should result in 3 batches: [10, 10, 5]
    def make_response(batch_chunk):
        items = [
            {"reId": e["reId"], "score": 0.50 + (e["reId"] * 0.01)}
            for e in batch_chunk
        ]
        resp = MagicMock()
        resp.choices = [
            MagicMock(message=MagicMock(content=__import__("json").dumps({"scored_entities": items})))
        ]
        return resp

    batch_1_resp = make_response(large_entities[0:10])
    batch_2_resp = make_response(large_entities[10:20])
    batch_3_resp = make_response(large_entities[20:25])

    with patch("pipeline.scorer.Groq") as mock_groq:
        mock_groq.return_value.chat.completions.create.side_effect = [
            batch_1_resp,
            batch_2_resp,
            batch_3_resp,
        ]
        ranked = score_and_rank(large_entities, sample_jd, batch_size=10)

        # Groq completions should have been called exactly 3 times
        assert mock_groq.return_value.chat.completions.create.call_count == 3

        # Category caps: project cap 3, work_exp cap 2 -> total 5 selected
        projects = [e for e in ranked if e["reType"] == "project"]
        work_exps = [e for e in ranked if e["reType"] == "work_exp"]
        assert len(projects) == 3
        assert len(work_exps) == 2
        assert len(ranked) == 5


def test_score_and_rank_achievements_and_others_caps(sample_jd):
    """Ensure 'achievements' and 'others' caps match schema and are enforced."""
    entities = [
        {"reId": 1, "reType": "achievements", "title": "Hackathon 1", "normalizedSkills": ["python"]},
        {"reId": 2, "reType": "achievements", "title": "Hackathon 2", "normalizedSkills": ["python"]},
        {"reId": 3, "reType": "achievements", "title": "Hackathon 3", "normalizedSkills": ["python"]},
        {"reId": 4, "reType": "others", "title": "Volunteer 1", "normalizedSkills": ["python"]},
        {"reId": 5, "reType": "others", "title": "Volunteer 2", "normalizedSkills": ["python"]},
    ]
    mock_llm_output = {
        "scored_entities": [
            {"reId": 1, "score": 0.90},
            {"reId": 2, "score": 0.85},
            {"reId": 3, "score": 0.80},
            {"reId": 4, "score": 0.70},
            {"reId": 5, "score": 0.60},
        ]
    }
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(message=MagicMock(content=__import__("json").dumps(mock_llm_output)))
    ]

    with patch("pipeline.scorer.Groq") as mock_groq:
        mock_groq.return_value.chat.completions.create.return_value = mock_response
        ranked = score_and_rank(entities, sample_jd)

        achievements = [e for e in ranked if e["reType"] == "achievements"]
        others = [e for e in ranked if e["reType"] == "others"]

        # achievements capped at 2, others capped at 1
        assert len(achievements) == 2
        assert [a["reId"] for a in achievements] == [1, 2]
        assert len(others) == 1
        assert [o["reId"] for o in others] == [4]
        assert len(ranked) == 3




# ---------------------------------------------------------------------------
# Prompt size, rate limits and deterministic ranking
# ---------------------------------------------------------------------------
import json

import httpx
from groq import RateLimitError

from pipeline import scorer


def _llm_reply(scores):
    """A fake Groq response whose content is {"scored_entities": [...]} for {reId: score}."""
    resp = MagicMock()
    resp.choices = [MagicMock(message=MagicMock(content=json.dumps(
        {"scored_entities": [{"reId": i, "score": s} for i, s in scores.items()]}
    )))]
    return resp


def _rate_limit_error(headers=None):
    request = httpx.Request("POST", "https://api.groq.com/openai/v1/chat/completions")
    response = httpx.Response(429, headers=headers or {}, request=request)
    return RateLimitError("rate limited", response=response, body=None)


def test_prompt_sends_only_the_fields_the_llm_needs(sample_jd):
    entity = {
        "reId": 7, "reType": "project", "title": "DocChat", "subtitle": "Personal",
        "description": "RAG service over PDFs", "fromDate": "2024-01-01", "toDate": None,
        "originalSkills": ["Python3"], "normalizedSkills": ["python"], "displaySkills": ["Python"],
        "links": [{"id": 1, "link": "https://example.com/SECRET-LINK"}],
        "assets": [{"asset_id": 2, "link": "https://img.example.com/SECRET-ASSET.png"}],
    }
    with patch("pipeline.scorer.Groq") as mock_groq:
        create = mock_groq.return_value.chat.completions.create
        create.return_value = _llm_reply({7: 0.9})
        score_and_rank([entity], sample_jd)
        prompt = create.call_args.kwargs["messages"][1]["content"]

    assert "RAG service over PDFs" in prompt and '"skills":["Python"]' in prompt
    for left_out in ("SECRET-LINK", "SECRET-ASSET", "originalSkills", "normalizedSkills", '"toDate"'):
        assert left_out not in prompt


def test_rate_limit_waits_for_retry_after_header(sample_entities, sample_jd):
    with patch("pipeline.scorer.Groq") as mock_groq, patch("pipeline.scorer.time.sleep") as sleep:
        mock_groq.return_value.chat.completions.create.side_effect = [
            _rate_limit_error({"retry-after": "7"}),
            _llm_reply({1: 0.5, 2: 0.9, 3: 0.6}),
        ]
        ranked = score_and_rank(sample_entities, sample_jd)

    sleep.assert_called_once_with(7.0)
    assert len(ranked) == 3


def test_rate_limit_without_header_uses_fallback_and_gives_up_after_max_attempts(sample_entities, sample_jd):
    with patch("pipeline.scorer.Groq") as mock_groq, patch("pipeline.scorer.time.sleep") as sleep:
        mock_groq.return_value.chat.completions.create.side_effect = _rate_limit_error()
        with pytest.raises(RateLimitError):
            score_and_rank(sample_entities, sample_jd)

    assert mock_groq.return_value.chat.completions.create.call_count == scorer.MAX_ATTEMPTS
    assert [c.args[0] for c in sleep.call_args_list] == [scorer.RATE_LIMIT_FALLBACK_SECONDS] * (scorer.MAX_ATTEMPTS - 1)


def test_skill_score_and_rank_score_values(sample_entities, sample_jd):
    # JD: must python/fastapi/postgresql (1.0 each), preferred docker/redis (0.6), good aws (0.3).
    with patch("pipeline.scorer.Groq") as mock_groq:
        mock_groq.return_value.chat.completions.create.return_value = _llm_reply({1: 0.45, 2: 0.95, 3: 0.78})
        ranked = {e["reId"]: e for e in score_and_rank(sample_entities, sample_jd)}

    assert ranked[2]["skillScore"] == 1.0                 # 3 must-haves -> saturated
    assert ranked[2]["rankScore"] == round(0.7 * 0.95 + 0.3 * 1.0, 4)
    assert ranked[3]["skillScore"] == round(0.6 / 3, 4)   # only redis (preferred)
    assert ranked[1]["skillScore"] == round(1.0 / 3, 4)   # only postgresql
    assert ranked[2]["score"] == 0.95                     # the LLM score is kept as-is


def test_equal_llm_scores_are_ordered_by_skill_overlap(sample_jd):
    entities = [
        {"reId": 1, "reType": "project", "title": "No JD skills", "normalizedSkills": ["figma"]},
        {"reId": 2, "reType": "project", "title": "Two must-haves", "normalizedSkills": ["python", "fastapi"]},
    ]
    with patch("pipeline.scorer.Groq") as mock_groq:
        mock_groq.return_value.chat.completions.create.return_value = _llm_reply({1: 0.6, 2: 0.6})
        ranked = score_and_rank(entities, sample_jd)

    assert [e["reId"] for e in ranked] == [2, 1]


def test_full_ties_go_to_the_more_recent_entity_then_lower_reid(sample_jd):
    # Same LLM score, no skills: order must not depend on input order.
    entities = [
        {"reId": 30, "reType": "project", "title": "Old", "fromDate": "2022-01-01"},
        {"reId": 20, "reType": "project", "title": "Undated"},
        {"reId": 11, "reType": "project", "title": "New B", "fromDate": "2023-09-01"},
        {"reId": 10, "reType": "project", "title": "New A", "fromDate": "2023-09-01"},
    ]
    with patch("pipeline.scorer.Groq") as mock_groq:
        mock_groq.return_value.chat.completions.create.return_value = _llm_reply({30: 0.45, 20: 0.45, 11: 0.45, 10: 0.45})
        first = [e["reId"] for e in score_and_rank(entities, sample_jd)]
        second = [e["reId"] for e in score_and_rank(list(reversed(entities)), sample_jd)]

    assert first == second == [10, 11, 30]   # cap 3: the undated one is cut


def test_skills_cannot_lift_an_entity_the_llm_rejected(sample_jd):
    stuffed = [
        {"reId": 1, "reType": "project", "title": "Real", "normalizedSkills": ["python"]},
        {"reId": 2, "reType": "project", "title": "Stuffed",
         "normalizedSkills": ["python", "fastapi", "postgresql", "docker", "redis", "aws"]},
    ]
    with patch("pipeline.scorer.Groq") as mock_groq:
        mock_groq.return_value.chat.completions.create.return_value = _llm_reply({1: 0.5, 2: 0.10})
        ranked = score_and_rank(stuffed, sample_jd)

    assert [e["reId"] for e in ranked] == [1]


def test_entity_without_skills_ranks_by_llm_score_alone(sample_jd):
    entities = [{"reId": 1, "reType": "others", "title": "Reading"}]
    with patch("pipeline.scorer.Groq") as mock_groq:
        mock_groq.return_value.chat.completions.create.return_value = _llm_reply({1: 0.3})
        (only,) = score_and_rank(entities, sample_jd)

    assert only["skillScore"] is None and only["rankScore"] == 0.3


def test_jd_phrases_match_entity_skills():
    jd = {"mustHaveSkills": ["aws (sagemaker, s3, ec2)"], "preferredSkills": [], "goodToHaveSkills": []}
    tiers = scorer._jd_skill_tiers(jd)
    assert scorer._skill_score({"normalizedSkills": ["aws sagemaker"]}, tiers) == round(1.0 / 3, 4)
    assert scorer._skill_score({"normalizedSkills": ["deep learning"]}, tiers) == 0.0


def test_skill_in_two_jd_tiers_counts_once_at_the_higher_weight():
    jd = {"mustHaveSkills": ["python"], "preferredSkills": ["Python3"], "goodToHaveSkills": ["py"]}
    tiers = scorer._jd_skill_tiers(jd)
    assert len(tiers) == 1 and tiers[0][1] == 1.0


def test_rate_limit_longer_than_max_wait_fails_fast(sample_entities, sample_jd):
    # Daily-limit 429s ask for minutes ("try again in 9m34s"); sleeping and retrying cannot help.
    with patch("pipeline.scorer.Groq") as mock_groq, patch("pipeline.scorer.time.sleep") as sleep:
        mock_groq.return_value.chat.completions.create.side_effect = _rate_limit_error({"retry-after": "574"})
        with pytest.raises(RateLimitError):
            score_and_rank(sample_entities, sample_jd)

    assert mock_groq.return_value.chat.completions.create.call_count == 1
    sleep.assert_not_called()
