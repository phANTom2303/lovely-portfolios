import pytest

from pipeline.portfolio_formatter import SECTION_ORDER, build_portfolio_document, format_grade
from pipeline.skill_synonyms import SKILL_CATEGORIES, SKILL_SYNONYMS

PROFILE = {
    "name": "Guddu",
    "professionalTitle": "Developer",
    "about": "About me.",
    "currentLocation": "Pune",
    "email": "g@example.com",
    "profilePhotoLink": "https://example.com/g.jpg",
    "socials": [{"id": 1, "title": "GitHub", "link": "https://github.com/g", "description": "mine"}],
    "profileSkills": ["js", "Node.js", "JavaScript", "postgres", "Public Speaking"],
    "education": [{
        "institute_name": "KIIT", "education_type": "under_graduate", "stream": "CSE",
        "from_date": "2022-08-01", "to_date": None, "marks": 9.0, "mark_type": "gpa", "total_mark": 10.0,
    }],
}


def entity(re_id, re_type, **over):
    row = {
        "reId": re_id, "reType": re_type, "title": f"T{re_id}", "subtitle": f"S{re_id}",
        "description": f"original {re_id}", "fromDate": "2023-01-01", "toDate": None,
        "displaySkills": ["Python"], "score": 0.9,
        "links": [{"id": 5, "title": "Repo", "link": "https://x", "description": "d"}],
        "assets": [{"asset_id": 6, "title": "Pic", "link": "https://y", "description": "d", "asset_type": "image"}],
    }
    row.update(over)
    return row


def rewritten(*entities):
    return {"jobRole": "Dev", "sections": [{"reType": "x", "entities": [
        {"reId": re_id, "title": "changed by llm", "rewrittenDescription": text} for re_id, text in entities
    ]}]}


def build(scored=(), rewrites=(), profile=PROFILE):
    return build_portfolio_document(list(scored), rewritten(*rewrites), profile)


@pytest.mark.parametrize("re_type, section, title_key, subtitle_key", [
    ("work_exp", "experience", "role", "company"),
    ("project", "projects", "name", "subtitle"),
    ("certification", "certifications", "title", "org"),
    ("achievements", "achievements", "title", "org"),
    ("extra_curricular", "extraCurricular", "role", "org"),
])
def test_title_and_subtitle_are_mapped_per_section(re_type, section, title_key, subtitle_key):
    item = build([entity(1, re_type)], [(1, "rewritten")])[section]["items"][0]
    assert item[title_key] == "T1" and item[subtitle_key] == "S1"
    assert item["description"] == "rewritten"
    assert item["from_date"] == "2023-01-01" and item["to_date"] is None
    assert "reId" not in item and "score" not in item


def test_document_has_exactly_the_expected_top_level_keys():
    doc = build()
    assert set(doc) == {"sectionOrder", *SECTION_ORDER}
    assert doc["sectionOrder"] == SECTION_ORDER
    assert doc["projects"] == {"items": []}


def test_items_keep_the_scorer_order_not_the_llm_order():
    scored = [entity(2, "project"), entity(1, "project")]
    items = build(scored, [(1, "one"), (2, "two")])["projects"]["items"]
    assert [i["name"] for i in items] == ["T2", "T1"]
    assert [i["description"] for i in items] == ["two", "one"]


def test_only_the_description_comes_from_the_llm():
    item = build([entity(1, "project")], [(1, "rewritten")])["projects"]["items"][0]
    assert item["name"] == "T1"


def test_entity_the_llm_invented_is_left_out():
    assert len(build([entity(1, "project")], [(1, "a"), (99, "made up")])["projects"]["items"]) == 1


def test_entity_the_rewriter_skipped_keeps_its_original_description():
    assert build([entity(1, "project")])["projects"]["items"][0]["description"] == "original 1"


def test_others_type_has_no_section_and_is_left_out():
    doc = build([entity(1, "others")], [(1, "a")])
    assert "others" not in doc
    assert all(doc[k]["items"] == [] for k in ("experience", "projects", "certifications", "achievements", "extraCurricular"))


def test_links_and_assets_drop_internal_fields():
    item = build([entity(1, "project")], [(1, "a")])["projects"]["items"][0]
    assert item["links"] == [{"title": "Repo", "link": "https://x"}]
    assert item["assets"] == [{"asset_type": "image", "link": "https://y", "title": "Pic", "description": "d"}]


def test_about_and_contact():
    doc = build()
    assert doc["about"] == {
        "name": "Guddu", "title": "Developer", "about": "About me.", "current_location": "Pune",
        "profile_photo_link": "https://example.com/g.jpg", "email": "g@example.com",
        "socials": [{"title": "GitHub", "link": "https://github.com/g"}],
    }
    assert doc["contact"] == {"email": "g@example.com"}


def test_education_item():
    assert build()["education"]["items"] == [{
        "degree": "Undergraduate", "stream": "CSE", "institute_name": "KIIT",
        "from_date": "2022-08-01", "to_date": None, "grade": "CGPA 9.0 / 10.0",
    }]


def test_education_without_a_type_still_has_a_heading():
    profile = {**PROFILE, "education": [{"education_type": None}]}
    item = build(profile=profile)["education"]["items"][0]
    assert item["degree"] == "Education" and item["grade"] == ""


@pytest.mark.parametrize("marks, mark_type, total, expected", [
    (9.0, "gpa", 10.0, "CGPA 9.0 / 10.0"),
    (3.85, "gpa", 4.0, "CGPA 3.85 / 4.0"),
    (8.9, "gpa", None, "CGPA 8.9"),
    (92.4, "percentage", 100.0, "92.4%"),
    (92.0, "percentage", 100.0, "92%"),
    (None, "gpa", 10.0, ""),
])
def test_format_grade(marks, mark_type, total, expected):
    assert format_grade(marks, mark_type, total) == expected


def test_skills_are_normalized_grouped_deduplicated_and_ordered():
    assert build()["skills"]["categories"] == [
        {"name": "Languages", "skills": ["JavaScript"]},
        {"name": "Frameworks & Libraries", "skills": ["Node.js"]},
        {"name": "Databases", "skills": ["PostgreSQL"]},
        {"name": "Other", "skills": ["Public Speaking"]},
    ]


def test_no_profile_skills_means_no_categories():
    assert build(profile={**PROFILE, "profileSkills": []})["skills"] == {"categories": []}


def test_every_known_skill_has_a_category():
    assert set(SKILL_CATEGORIES) == set(SKILL_SYNONYMS)
