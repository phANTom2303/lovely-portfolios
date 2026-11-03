"""
Step 5: turn the pipeline's result into the document the portfolio page renders
(frontend/src/pages/Portfolio/portfolioDocument.js). No LLM in here.

The scored entities are the source of truth for which entities appear, their order, type, title,
subtitle, dates, skills, links and assets. Only the rewritten description comes from the LLM.
"""
from typing import Any, Dict, List

from pipeline.skill_normalizer import display_list, normalize_one
from pipeline.skill_synonyms import SKILL_CATEGORIES

SECTION_ORDER = [
    "about",
    "skills",
    "experience",
    "projects",
    "achievements",
    "certifications",
    "education",
    "extraCurricular",
    "contact",
]

# re_type -> (section, field for resume_entity.title, field for resume_entity.subtitle)
# re_type 'others' has no section in the document, so those entities are left out.
ENTITY_SECTIONS = {
    "work_exp": ("experience", "role", "company"),
    "project": ("projects", "name", "subtitle"),
    "certification": ("certifications", "title", "org"),
    "achievements": ("achievements", "title", "org"),
    "extra_curricular": ("extraCurricular", "role", "org"),
}

CATEGORY_ORDER = [
    "Languages",
    "Frameworks & Libraries",
    "Databases",
    "Tools & DevOps",
    "AI & Machine Learning",
    "Concepts",
    "Other",
]

# The education table has no degree column, and the page uses this field as the card's heading.
DEGREE_LABELS = {
    "secondary": "Secondary (Class X)",
    "higher_secondary": "Higher Secondary (Class XII)",
    "under_graduate": "Undergraduate",
    "post_graduate": "Postgraduate",
    "diploma": "Diploma",
    "phd": "PhD",
}


def format_grade(marks: float | None, mark_type: str | None, total_mark: float | None) -> str:
    """marks + mark_type + total_mark -> "CGPA 9.0 / 10.0" or "92.4%". Empty if there are no marks."""
    if marks is None:
        return ""
    if mark_type == "percentage":
        return f"{marks:g}%"
    grade = f"CGPA {float(marks)}"
    return f"{grade} / {float(total_mark)}" if total_mark is not None else grade


def _categorize_skills(skills: List[str]) -> List[Dict[str, Any]]:
    """Group skills by category, in CATEGORY_ORDER, dropping duplicates and empty categories."""
    by_category: Dict[str, Dict[str, str]] = {}
    for skill in skills:
        canonical = normalize_one(skill)
        shown = display_list([skill])
        if canonical and shown:
            category = SKILL_CATEGORIES.get(canonical, "Other")
            by_category.setdefault(category, {}).setdefault(canonical, shown[0])
    return [
        {"name": name, "skills": list(by_category[name].values())}
        for name in CATEGORY_ORDER
        if name in by_category
    ]


def _education_item(row: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "degree": DEGREE_LABELS.get(row.get("education_type"), "Education"),
        "stream": row.get("stream") or "",
        "institute_name": row.get("institute_name") or "",
        "from_date": row.get("from_date"),
        "to_date": row.get("to_date"),
        "grade": format_grade(row.get("marks"), row.get("mark_type"), row.get("total_mark")),
    }


def _link_item(link: Dict[str, Any]) -> Dict[str, Any]:
    return {"title": link.get("title") or "", "link": link.get("link") or ""}


def _asset_item(asset: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "asset_type": asset.get("asset_type"),
        "link": asset.get("link") or "",
        "title": asset.get("title") or "",
        "description": asset.get("description") or "",
    }


def build_portfolio_document(
    scored_entities: List[Dict[str, Any]], rewritten: Dict[str, Any], user_profile: Dict[str, Any]
) -> Dict[str, Any]:
    """Build the document. Entities keep the scorer's order, so the first project is the best match."""
    rewritten_by_id = {
        entity["reId"]: entity["rewrittenDescription"]
        for section in rewritten.get("sections", [])
        for entity in section["entities"]
    }

    sections: Dict[str, List[Dict[str, Any]]] = {
        section: [] for section, _, _ in ENTITY_SECTIONS.values()
    }
    for entity in scored_entities:
        mapping = ENTITY_SECTIONS.get(entity.get("reType"))
        if mapping is None:
            continue
        section, title_field, subtitle_field = mapping
        sections[section].append(
            {
                title_field: entity.get("title") or "",
                subtitle_field: entity.get("subtitle") or "",
                "from_date": entity.get("fromDate"),
                "to_date": entity.get("toDate"),
                # If the rewriter skipped an entity, its original text is still true.
                "description": rewritten_by_id.get(entity.get("reId")) or entity.get("description") or "",
                "skills": entity.get("displaySkills") or [],
                "assets": [_asset_item(a) for a in entity.get("assets") or []],
                "links": [_link_item(l) for l in entity.get("links") or []],
            }
        )

    email = user_profile.get("email") or ""
    return {
        "sectionOrder": list(SECTION_ORDER),
        "about": {
            "name": user_profile.get("name") or "",
            "title": user_profile.get("professionalTitle") or "",
            "about": user_profile.get("about") or "",
            "current_location": user_profile.get("currentLocation") or "",
            "profile_photo_link": user_profile.get("profilePhotoLink") or "",
            "email": email,
            "socials": [_link_item(s) for s in user_profile.get("socials") or []],
        },
        "skills": {"categories": _categorize_skills(user_profile.get("profileSkills") or [])},
        **{section: {"items": items} for section, items in sections.items()},
        "education": {"items": [_education_item(e) for e in user_profile.get("education") or []]},
        "contact": {"email": email},
    }
