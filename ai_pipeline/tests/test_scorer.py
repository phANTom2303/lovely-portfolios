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

        assert len(ranked) == 2
        assert ranked[0]["reId"] == 2
        assert ranked[0]["score"] == 0.85
        assert ranked[1]["reId"] == 1
        assert ranked[1]["score"] == 0.80


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


