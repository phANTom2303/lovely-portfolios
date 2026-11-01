import pytest

from pipeline.skill_normalizer import (
    _ALIAS_TO_CANONICAL,
    _build_alias_lookup,
    _clean,
    normalize_jd,
    normalize_list,
    normalize_one,
    normalize_skills,
)


@pytest.mark.parametrize("raw, expected", [
    ("JS", "javascript"),
    ("  Node.JS ", "nodejs"),
    ("Postgres", "postgresql"),
    ("K8S", "kubernetes"),
    ("REST   APIs", "rest apis"),
    ("javascript", "javascript"),
    # punctuation must survive cleaning
    ("C++", "c++"),
    ("C#", "c#"),
    ("CI/CD", "ci/cd"),
    ("scikit-learn", "scikit-learn"),
])
def test_dictionary_hits(raw, expected):
    assert normalize_one(raw) == expected


@pytest.mark.parametrize("raw, expected", [
    ("pyhton", "python"),
    ("javascrpit", "javascript"),
    ("kubernets", "kubernetes"),
    ("postgress", "postgresql"),
    ("typscript", "typescript"),
])
def test_fuzzy_catches_typos(raw, expected):
    assert normalize_one(raw) == expected


def test_look_alike_skills_do_not_merge():
    assert normalize_one("java") == "java"
    assert normalize_one("javascript") == "javascript"
    assert normalize_one("c") == "c"
    assert normalize_one("css") == "css"


@pytest.mark.parametrize("raw, expected", [
    ("Lightroom", "lightroom"),
    ("Figma Plugins", "figma plugins"),
    ("  Some  New   Tool ", "some new tool"),
    ("gp", "gp"),  # too short for fuzzy, stays as typed (cleaned)
])
def test_unknown_skill_kept_cleaned(raw, expected):
    assert normalize_one(raw) == expected


@pytest.mark.parametrize("raw", ["", "   "])
def test_blank_skill_returns_empty(raw):
    assert normalize_one(raw) == ""


def test_normalize_list_dedupes_keeps_order_and_skips_junk():
    assert normalize_list(["JS", "Node", "javascript", "", None, 5, "Postgres"]) == [
        "javascript", "nodejs", "postgresql",
    ]


@pytest.mark.parametrize("value", [None, []])
def test_normalize_list_empty_inputs(value):
    assert normalize_list(value) == []


def test_normalize_skills_adds_field_and_keeps_the_rest():
    entities = [{
        "reId": 1, "reType": "project", "title": "Tracker", "description": "d",
        "originalSkills": ["JS", "Node", "Postgres"],
        "fromDate": "2024-01-01", "toDate": "2024-05-01",
    }]
    result = normalize_skills(entities, {})

    assert result[0]["normalizedSkills"] == ["javascript", "nodejs", "postgresql"]
    for key in ("reId", "reType", "title", "description", "originalSkills", "fromDate", "toDate"):
        assert result[0][key] == entities[0][key]


def test_normalize_skills_does_not_mutate_input():
    entities = [{"reId": 1, "originalSkills": ["JS"]}]
    normalize_skills(entities)
    assert "normalizedSkills" not in entities[0]


def test_normalize_skills_handles_missing_skills():
    assert normalize_skills([{"reId": 1}])[0]["normalizedSkills"] == []
    assert normalize_skills([]) == []


def test_normalize_jd_only_touches_skill_lists():
    jd = {
        "jobRole": "Backend Intern",
        "mustHaveSkills": ["Python", "Postgres"],
        "preferredSkills": ["Docker"],
        "goodToHaveSkills": ["AWS"],
        "responsibilities": ["Build REST APIs"],
        "domainKeywords": ["FinTech"],
        "experienceLevel": "fresher",
    }
    result = normalize_jd(jd)

    assert result["mustHaveSkills"] == ["python", "postgresql"]
    assert result["preferredSkills"] == ["docker"]
    assert result["goodToHaveSkills"] == ["aws"]
    for key in ("jobRole", "responsibilities", "domainKeywords", "experienceLevel"):
        assert result[key] == jd[key]
    assert jd["mustHaveSkills"] == ["Python", "Postgres"]  # input untouched


def test_user_and_jd_skills_end_up_comparable():
    user = normalize_skills([{"reId": 1, "originalSkills": ["Postgres", "Node"]}])
    jd = normalize_jd({"mustHaveSkills": ["PostgreSQL", "Node.js"]})
    assert user[0]["normalizedSkills"] == jd["mustHaveSkills"]


# --- dictionary integrity -------------------------------------------------

def test_alias_claimed_by_two_skills_is_rejected():
    with pytest.raises(ValueError):
        _build_alias_lookup({"a": ["x"], "b": ["x"]})


def test_every_dictionary_key_is_already_clean():
    # A key that isn't lowercase/trimmed/single-spaced could never be matched.
    assert all(key == _clean(key) for key in _ALIAS_TO_CANONICAL)
