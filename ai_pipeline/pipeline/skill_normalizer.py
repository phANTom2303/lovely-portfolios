from thefuzz import fuzz, process

from pipeline.skill_synonyms import SKILL_SYNONYMS

# Fuzzy layer settings. Against our own dictionary, real typos score 83-95 with
# fuzz.ratio, while the closest look-alike *different* skills an unknown string
# could hit (rust/rest, sql/mysql) score 75, so 80 sits in the gap.
FUZZY_CUTOFF = 80
# Below this length one wrong letter changes the skill ("go" vs "no") and short
# strings score unreliably, so they only match exactly.
MIN_FUZZY_LENGTH = 4

JD_SKILL_FIELDS = ("mustHaveSkills", "preferredSkills", "goodToHaveSkills")


def _build_alias_lookup(synonyms: dict[str, list[str]]) -> dict[str, str]:
    """Invert {canonical: [aliases]} into {alias or canonical: canonical}."""
    lookup: dict[str, str] = {}
    for canonical, aliases in synonyms.items():
        for name in (canonical, *aliases):
            if lookup.setdefault(name, canonical) != canonical:
                raise ValueError(
                    f"alias {name!r} maps to both {lookup[name]!r} and {canonical!r}"
                )
    return lookup


# Built once at import so each lookup is a single dict access.
_ALIAS_TO_CANONICAL = _build_alias_lookup(SKILL_SYNONYMS)


def _clean(skill: str) -> str:
    # Lowercase and tidy whitespace only. Punctuation stays: "c++", "c#" and
    # "ci/cd" are real dictionary keys.
    return " ".join(skill.lower().split())


def normalize_one(skill: str) -> str:
    """
    Map one raw skill string to its canonical name.
    Order: dictionary lookup (exact + synonyms), then fuzzy match, then fall
    back to the cleaned original so an unknown skill is never lost.
    """
    cleaned = _clean(skill)

    if cleaned in _ALIAS_TO_CANONICAL:
        return _ALIAS_TO_CANONICAL[cleaned]

    if len(cleaned) >= MIN_FUZZY_LENGTH:
        # processor=None: thefuzz would otherwise strip punctuation before comparing.
        match = process.extractOne(
            cleaned,
            _ALIAS_TO_CANONICAL.keys(),
            scorer=fuzz.ratio,
            processor=None,
            score_cutoff=FUZZY_CUTOFF,
        )
        if match:
            return _ALIAS_TO_CANONICAL[match[0]]

    return cleaned


def normalize_list(skills: list | None) -> list[str]:
    """Normalize a list of skills; drop empties and duplicates, keep first-seen order."""
    seen: dict[str, None] = {}
    for skill in skills or []:
        if not isinstance(skill, str):
            continue
        name = normalize_one(skill)
        if name:
            seen.setdefault(name, None)
    return list(seen)


def normalize_skills(user_entities: list, jd_extraction: dict | None = None) -> list:
    """
    Step 2: add `normalizedSkills` (canonical names) to each of the user's entities.
    Every other field passes through, since Steps 3 and 4 read them. Entities are
    copied, never mutated. `jd_extraction` is unused here; it stays in the signature
    because main.py passes it. The JD's own skills go through normalize_jd.
    """
    normalized = []
    for entity in user_entities:
        item = dict(entity)
        item["normalizedSkills"] = normalize_list(entity.get("originalSkills"))
        normalized.append(item)
    return normalized


def normalize_jd(jd_extraction: dict) -> dict:
    """
    Normalize the three JD skill lists so the JD and the user's entities share one
    vocabulary. responsibilities and domainKeywords are phrases, not skills, and
    are left alone.
    """
    normalized = dict(jd_extraction)
    for field in JD_SKILL_FIELDS:
        normalized[field] = normalize_list(jd_extraction.get(field))
    return normalized
