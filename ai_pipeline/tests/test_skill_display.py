"""
Display names for skills.

Matching uses an internal lowercase key (`nodejs`). What a person reads on the portfolio must be the
proper name ("Node.js"). The flow is: the user's spelling -> normalizer fixes typos / merges aliases
-> canonical key -> SKILL_DISPLAY_NAMES gives the name to show. A skill we have no entry for keeps
the user's own spelling.
"""
from itertools import combinations

from thefuzz import fuzz

from pipeline import skill_synonyms
from pipeline.skill_normalizer import (
    FUZZY_CUTOFF,
    MIN_FUZZY_LENGTH,
    _ALIAS_TO_CANONICAL,
    normalize_one,
    normalize_skills,
)


def _display(skills):
    """displaySkills that normalize_skills produces for one entity with these original skills."""
    return normalize_skills([{"reId": 1, "originalSkills": skills}])[0]["displaySkills"]


# ---------------------------------------------------------------- the display-name dictionary

def test_every_canonical_skill_has_a_display_name():
    missing = set(skill_synonyms.SKILL_SYNONYMS) - set(skill_synonyms.SKILL_DISPLAY_NAMES)
    assert not missing, f"no display name for: {sorted(missing)}"


def test_no_display_name_is_left_over_without_a_canonical_skill():
    orphans = set(skill_synonyms.SKILL_DISPLAY_NAMES) - set(skill_synonyms.SKILL_SYNONYMS)
    assert not orphans, f"display names with no canonical skill: {sorted(orphans)}"


def test_display_names_are_clean_and_unique():
    names = list(skill_synonyms.SKILL_DISPLAY_NAMES.values())
    assert all(n and n == n.strip() and "  " not in n for n in names)
    assert len(names) == len(set(names)), "two skills share one display name"


def test_every_display_name_matches_back_to_its_own_skill():
    # if someone types the display name itself, it must land on the same skill
    for canonical, shown in skill_synonyms.SKILL_DISPLAY_NAMES.items():
        assert normalize_one(shown) == canonical, f"{shown!r} does not normalize to {canonical!r}"


def test_no_two_different_skills_are_within_fuzzy_range_of_each_other():
    # Guard for growing the dictionary: a near-identical pair would let a typo of one
    # become the other. Short names only match exactly, so they are excluded.
    keys = [k for k in _ALIAS_TO_CANONICAL if len(k) >= MIN_FUZZY_LENGTH]
    clashes = [
        (a, b, fuzz.ratio(a, b))
        for a, b in combinations(keys, 2)
        if _ALIAS_TO_CANONICAL[a] != _ALIAS_TO_CANONICAL[b] and fuzz.ratio(a, b) >= FUZZY_CUTOFF
    ]
    assert not clashes, f"different skills too similar: {clashes}"


# ---------------------------------------------------------------- displaySkills on entities

def test_known_skills_are_shown_with_their_proper_names():
    assert _display(["JS", "Node", "Postgres"]) == ["JavaScript", "Node.js", "PostgreSQL"]


def test_typos_are_fixed_before_display():
    assert _display(["Nod.js", "Pyhton"]) == ["Node.js", "Python"]


def test_the_users_own_spelling_is_ignored_for_known_skills():
    assert _display(["NODEJS", "react.js", "k8s"]) == ["Node.js", "React", "Kubernetes"]


def test_duplicates_are_removed_by_skill_and_first_seen_order_is_kept():
    assert _display(["JS", "Python", "JavaScript", "javascript", "py"]) == ["JavaScript", "Python"]


def test_unknown_skill_keeps_the_users_own_spelling_tidied():
    assert _display(["  Adobe   Lightroom "]) == ["Adobe Lightroom"]


def test_unknown_skill_written_two_ways_is_shown_once_with_the_first_spelling():
    assert _display(["Lightroom", "lightroom"]) == ["Lightroom"]


def test_missing_none_and_non_string_skills_give_an_empty_or_clean_list():
    assert normalize_skills([{"reId": 1}])[0]["displaySkills"] == []
    assert normalize_skills([{"reId": 1, "originalSkills": None}])[0]["displaySkills"] == []
    assert _display(["", "   ", None, 5, "React"]) == ["React"]


def test_matching_keys_are_unchanged_by_the_display_feature():
    item = normalize_skills([{"reId": 1, "originalSkills": ["JS", "Node", "Postgres"]}])[0]
    assert item["normalizedSkills"] == ["javascript", "nodejs", "postgresql"]
    assert item["displaySkills"] == ["JavaScript", "Node.js", "PostgreSQL"]


def test_other_fields_still_pass_through():
    entity = {"reId": 4, "title": "T", "subtitle": "S", "links": [{"id": 1}], "originalSkills": ["JS"]}
    item = normalize_skills([entity])[0]
    for key in ("reId", "title", "subtitle", "links", "originalSkills"):
        assert item[key] == entity[key]
    assert "displaySkills" not in entity, "input must not be mutated"


# ---------------------------------------------------------------- AI and LLM skills

def test_langchain_langgraph_and_agentic_pipeline_have_proper_names():
    assert _display(["langchain", "langgraph", "agentic pipeline"]) == [
        "LangChain", "LangGraph", "Agentic Pipeline",
    ]


def test_their_spellings_and_typos_are_merged_and_fixed():
    assert _display(["Lang Chain", "lang-chain", "Langchian"]) == ["LangChain"]
    assert _display(["Lang Graph", "langgrph"]) == ["LangGraph"]
    assert _display(["Agentic Pipelines", "agentic workflow", "Agentic Workflows"]) == ["Agentic Pipeline"]


def test_langchain_and_langgraph_are_never_confused():
    assert normalize_one("langchain") != normalize_one("langgraph")
    assert _display(["LangChain", "LangGraph"]) == ["LangChain", "LangGraph"]


def test_related_but_different_terms_are_not_merged_into_agentic_pipeline():
    # kept as the user wrote them: they are different things
    assert _display(["Agentic AI", "Multi agent system"]) == ["Agentic AI", "Multi agent system"]
