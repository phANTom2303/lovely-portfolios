"""
Tests for db.fetch_user_re_data against the NEW schema (init.sql on frontend-integration):

  resume_entity(re_id, user_id, re_type, title, subtitle, description, from_date, to_date, status)
  skills(skill_id, skill_name, user_id, re_id)   -- re_id NULL = profile-level skill

No real database is used. FakeConn plays the part of Postgres: it holds in-memory tables, refuses
queries that use columns the new schema does not have, and applies the user / status / re_id
filters only if the SQL actually asks for them. So a query that forgets a filter fails a test.
"""
import asyncio
import datetime as dt
import uuid

import pytest

import db
from db import InvalidUserId, NoResumeEntities, UserNotFound

USER = "550e8400-e29b-41d4-a716-446655440000"
OTHER_USER = "9472faeb-f5d3-4b14-a215-245399ee3854"


class FakeConn:
    """Minimal stand-in for an asyncpg connection, backed by in-memory 'tables'."""

    def __init__(self, users=(), entities=(), skills=(), links=(), assets=()):
        self.users = list(users)
        self.entities = list(entities)
        self.skills = list(skills)
        self.links = list(links)
        self.assets = list(assets)
        self.sql_seen = []   # every SQL string the code sent
        self.closed = False

    async def fetchrow(self, sql, *args):
        self.sql_seen.append(sql)
        assert "FROM users" in sql, f"unexpected fetchrow query: {sql}"
        uid = args[0]
        return next((u for u in self.users if u["id"] == uid), None)

    async def fetch(self, sql, *args):
        self.sql_seen.append(sql)

        if "FROM resume_entity" in sql:
            if "skills_id" in sql:
                raise RuntimeError('column "skills_id" does not exist')   # what Postgres says
            uid = args[0]
            rows = [e for e in self.entities if e["user_id"] == uid]
            if "status = 'active'" in sql:
                rows = [e for e in rows if e["status"] == "active"]
            if "ORDER BY from_date DESC NULLS LAST" in sql:
                rows = sorted(rows, key=lambda e: e["from_date"] or dt.date.min, reverse=True)
            return rows

        if "FROM skills" in sql:
            assert "re_id" in sql, "skills must be looked up by re_id in the new schema"
            uid, re_ids = args[0], args[1]
            return [
                s for s in self.skills
                if s["user_id"] == uid and s["re_id"] is not None and s["re_id"] in re_ids
            ]

        if "FROM links" in sql or "FROM assets" in sql:
            table = self.links if "FROM links" in sql else self.assets
            assert "user_id = $1" in sql, "links/assets must be filtered by user_id"
            rows = [row for row in table if row["user_id"] == args[0]]
            # sort only if the SQL asks for it, so dropping the ORDER BY fails a test
            if "ORDER BY id" in sql:
                rows = sorted(rows, key=lambda row: row["id"])
            elif "ORDER BY asset_id" in sql:
                rows = sorted(rows, key=lambda row: row["asset_id"])
            return rows

        raise AssertionError(f"unexpected fetch query: {sql}")

    async def close(self):
        self.closed = True


def _user(**over):
    row = {
        "id": uuid.UUID(USER),
        "name": "Guddu Bhaiya",
        "professional_title": "Full Stack Developer",
        "about": "Passionate developer.",
        "current_location": "New York, NY",
    }
    row.update(over)
    return row


def _entity(re_id, **over):
    row = {
        "re_id": re_id,
        "user_id": uuid.UUID(USER),
        "re_type": "project",
        "title": f"Title {re_id}",
        "subtitle": f"Subtitle {re_id}",
        "description": f"Description {re_id}",
        "from_date": dt.date(2021, 1, 1),
        "to_date": dt.date(2021, 6, 1),
        "status": "active",
    }
    row.update(over)
    return row


def _skill(skill_id, name, re_id, user=USER):
    return {"skill_id": skill_id, "skill_name": name, "user_id": uuid.UUID(user), "re_id": re_id}


def _link(link_id, re_id, user=USER, **over):
    # the row carries user_id and re_id too: they must NOT leak into the output
    row = {
        "id": link_id, "user_id": uuid.UUID(user), "re_id": re_id,
        "link": f"https://example.com/link{link_id}", "title": f"Link {link_id}",
        "description": f"Link description {link_id}",
    }
    row.update(over)
    return row


def _asset(asset_id, re_id, user=USER, **over):
    # cloudinary_public_id is an internal deletion key: it must NOT reach the output
    row = {
        "asset_id": asset_id, "cloudinary_public_id": f"cloud/{asset_id}",
        "user_id": uuid.UUID(user), "re_id": re_id,
        "title": f"Asset {asset_id}", "link": f"https://img.example.com/{asset_id}.png",
        "description": f"Asset description {asset_id}", "asset_type": "image",
    }
    row.update(over)
    return row


def _run(conn, user_id=USER):
    """Call fetch_user_re_data with the fake connection plugged in."""
    async def fake_connect():
        return conn

    original = db.get_db_connection
    db.get_db_connection = fake_connect
    try:
        return asyncio.run(db.fetch_user_re_data(user_id))
    finally:
        db.get_db_connection = original


# ---------------------------------------------------------------- happy path

def test_skills_are_grouped_under_their_own_entity():
    conn = FakeConn(
        users=[_user()],
        entities=[_entity(1, from_date=dt.date(2022, 1, 1)), _entity(2)],
        skills=[
            _skill(1, "React", 1), _skill(2, "Node.js", 1), _skill(3, "PostgreSQL", 1),
            _skill(4, "JavaScript", 2),
        ],
    )
    _, entities = _run(conn)
    by_id = {e["reId"]: e for e in entities}
    assert by_id[1]["originalSkills"] == ["React", "Node.js", "PostgreSQL"]
    assert by_id[2]["originalSkills"] == ["JavaScript"]


def test_subtitle_is_returned_on_every_entity():
    conn = FakeConn(users=[_user()], entities=[_entity(1, title="Software Engineer", subtitle="TechCorp")])
    _, entities = _run(conn)
    assert entities[0]["title"] == "Software Engineer"
    assert entities[0]["subtitle"] == "TechCorp"


def test_entity_keeps_the_keys_the_pipeline_reads():
    conn = FakeConn(users=[_user()], entities=[_entity(1)])
    _, entities = _run(conn)
    for key in ("reId", "reType", "title", "description", "originalSkills", "fromDate", "toDate"):
        assert key in entities[0], f"downstream code reads {key!r}"


def test_user_profile_is_built_from_the_users_row():
    conn = FakeConn(users=[_user()], entities=[_entity(1)])
    profile, _ = _run(conn)
    assert profile["name"] == "Guddu Bhaiya"
    assert profile["professionalTitle"] == "Full Stack Developer"
    assert profile["currentLocation"] == "New York, NY"


def test_connection_is_closed_afterwards():
    conn = FakeConn(users=[_user()], entities=[_entity(1)])
    _run(conn)
    assert conn.closed


# ---------------------------------------------------------------- skills edge cases

def test_entity_without_skill_rows_gets_an_empty_list():
    conn = FakeConn(users=[_user()], entities=[_entity(1), _entity(2)], skills=[_skill(1, "React", 1)])
    _, entities = _run(conn)
    by_id = {e["reId"]: e for e in entities}
    assert by_id[2]["originalSkills"] == []


def test_same_skill_name_on_two_entities_is_kept_on_both():
    # the new schema stores one row per (entity, skill), so "React" appears twice
    conn = FakeConn(
        users=[_user()],
        entities=[_entity(1), _entity(2)],
        skills=[_skill(1, "React", 1), _skill(2, "React", 2)],
    )
    _, entities = _run(conn)
    assert all(e["originalSkills"] == ["React"] for e in entities)


def test_profile_level_skills_are_not_attached_to_any_entity():
    # re_id NULL = profile-level skill; it belongs to no entity
    conn = FakeConn(
        users=[_user()],
        entities=[_entity(1)],
        skills=[_skill(1, "Python", None), _skill(2, "React", 1)],
    )
    _, entities = _run(conn)
    assert entities[0]["originalSkills"] == ["React"]


def test_another_users_skill_rows_are_ignored():
    conn = FakeConn(
        users=[_user()],
        entities=[_entity(1)],
        skills=[_skill(1, "React", 1), _skill(2, "Cobol", 1, user=OTHER_USER)],
    )
    _, entities = _run(conn)
    assert entities[0]["originalSkills"] == ["React"]


# ---------------------------------------------------------------- entity selection / formatting

def test_only_active_entities_and_newest_first():
    conn = FakeConn(
        users=[_user()],
        entities=[
            _entity(1, from_date=dt.date(2019, 1, 1)),
            _entity(2, from_date=dt.date(2023, 1, 1)),
            _entity(3, status="draft"),
            _entity(4, status="deleted"),
        ],
    )
    _, entities = _run(conn)
    assert [e["reId"] for e in entities] == [2, 1]


def test_null_text_columns_become_empty_strings_and_null_dates_become_none():
    conn = FakeConn(
        users=[_user()],
        entities=[_entity(1, title=None, subtitle=None, description=None, from_date=None, to_date=None)],
    )
    _, entities = _run(conn)
    e = entities[0]
    assert e["title"] == "" and e["subtitle"] == "" and e["description"] == ""
    assert e["fromDate"] is None and e["toDate"] is None


def test_dates_are_returned_as_iso_strings():
    conn = FakeConn(users=[_user()], entities=[_entity(1, from_date=dt.date(2021, 6, 1), to_date=dt.date(2023, 8, 1))])
    _, entities = _run(conn)
    assert entities[0]["fromDate"] == "2021-06-01"
    assert entities[0]["toDate"] == "2023-08-01"


# ---------------------------------------------------------------- errors

def test_unknown_user_raises_user_not_found():
    conn = FakeConn(users=[], entities=[_entity(1)])
    with pytest.raises(UserNotFound):
        _run(conn)


def test_user_without_active_entities_raises():
    conn = FakeConn(users=[_user()], entities=[_entity(1, status="draft")])
    with pytest.raises(NoResumeEntities):
        _run(conn)


def test_invalid_uuid_is_rejected_before_touching_the_db():
    conn = FakeConn(users=[_user()], entities=[_entity(1)])
    with pytest.raises(InvalidUserId):
        _run(conn, user_id="not-a-uuid")
    assert conn.sql_seen == []


def test_database_errors_are_not_swallowed():
    class BrokenConn(FakeConn):
        async def fetch(self, sql, *args):
            raise RuntimeError("permission denied for table resume_entity")

    conn = BrokenConn(users=[_user()])
    with pytest.raises(RuntimeError, match="permission denied"):
        _run(conn)


# ---------------------------------------------------------------- schema + mock fallback

def test_no_query_mentions_the_removed_skills_id_column():
    conn = FakeConn(users=[_user()], entities=[_entity(1)])
    _run(conn)
    assert conn.sql_seen, "expected queries to have been sent"
    assert not any("skills_id" in sql for sql in conn.sql_seen)


def test_mock_fallback_when_database_is_unreachable_has_the_new_shape():
    async def no_connection():
        return None

    original = db.get_db_connection
    db.get_db_connection = no_connection
    try:
        profile, entities = asyncio.run(db.fetch_user_re_data(USER))
    finally:
        db.get_db_connection = original

    assert profile["name"] == "Demo User"
    assert entities and all("subtitle" in e for e in entities)


# ---------------------------------------------------------------- links, assets, socials
# Item key names are the schema's own column names:
#   link  -> id, title, link, description
#   asset -> asset_id, title, link, description, asset_type

def test_entity_links_are_attached_with_the_schema_key_names():
    conn = FakeConn(
        users=[_user()],
        entities=[_entity(1), _entity(2)],
        links=[_link(10, 1, title="Company Website", link="https://techcorp.com", description="TechCorp site"),
               _link(11, 2)],
    )
    _, entities = _run(conn)
    by_id = {e["reId"]: e for e in entities}
    assert by_id[1]["links"] == [
        {"id": 10, "title": "Company Website", "link": "https://techcorp.com", "description": "TechCorp site"}
    ]
    assert [l["id"] for l in by_id[2]["links"]] == [11]


def test_entity_assets_are_attached_with_the_schema_key_names():
    conn = FakeConn(
        users=[_user()],
        entities=[_entity(1)],
        assets=[_asset(5, 1, title="Home page", link="https://img.example.com/home.png",
                       description="Landing page", asset_type="image"),
                _asset(6, 1, title="Demo video", link="https://youtube.com/watch?v=abc",
                       description="", asset_type="youtube")],
    )
    _, entities = _run(conn)
    assert entities[0]["assets"] == [
        {"asset_id": 5, "title": "Home page", "link": "https://img.example.com/home.png",
         "description": "Landing page", "asset_type": "image"},
        {"asset_id": 6, "title": "Demo video", "link": "https://youtube.com/watch?v=abc",
         "description": "", "asset_type": "youtube"},
    ]


def test_internal_columns_never_reach_the_output():
    conn = FakeConn(users=[_user()], entities=[_entity(1)], links=[_link(1, 1)], assets=[_asset(1, 1)])
    _, entities = _run(conn)
    assert set(entities[0]["links"][0]) == {"id", "title", "link", "description"}
    assert set(entities[0]["assets"][0]) == {"asset_id", "title", "link", "description", "asset_type"}
    assert not any("cloudinary_public_id" in sql for sql in conn.sql_seen)


def test_entity_without_links_or_assets_gets_empty_lists():
    conn = FakeConn(users=[_user()], entities=[_entity(1), _entity(2)], links=[_link(1, 1)])
    _, entities = _run(conn)
    by_id = {e["reId"]: e for e in entities}
    assert by_id[2]["links"] == []
    assert by_id[2]["assets"] == []
    assert by_id[1]["assets"] == []


def test_profile_level_links_become_socials():
    conn = FakeConn(
        users=[_user()],
        entities=[_entity(1)],
        links=[_link(1, None, title="GitHub", link="https://github.com/johndoe", description="My GitHub Profile"),
               _link(2, None, title="LinkedIn", link="https://linkedin.com/in/johndoe", description=""),
               _link(3, 1)],
    )
    profile, entities = _run(conn)
    assert profile["socials"] == [
        {"id": 1, "title": "GitHub", "link": "https://github.com/johndoe", "description": "My GitHub Profile"},
        {"id": 2, "title": "LinkedIn", "link": "https://linkedin.com/in/johndoe", "description": ""},
    ]
    # the entity link is not a social, and the socials are not entity links
    assert [l["id"] for l in entities[0]["links"]] == [3]


def test_socials_is_an_empty_list_when_the_user_has_no_profile_links():
    conn = FakeConn(users=[_user()], entities=[_entity(1)], links=[_link(1, 1)])
    profile, _ = _run(conn)
    assert profile["socials"] == []


def test_profile_level_assets_are_ignored():
    # an asset with re_id NULL belongs to no entity; nothing in the pipeline uses it yet
    conn = FakeConn(users=[_user()], entities=[_entity(1)], assets=[_asset(1, None), _asset(2, 1)])
    profile, entities = _run(conn)
    assert [a["asset_id"] for a in entities[0]["assets"]] == [2]
    assert "assets" not in profile


def test_links_and_assets_of_inactive_entities_are_not_used():
    conn = FakeConn(
        users=[_user()],
        entities=[_entity(1), _entity(3, status="draft")],
        links=[_link(1, 1), _link(2, 3)],
        assets=[_asset(1, 1), _asset(2, 3)],
    )
    profile, entities = _run(conn)
    assert [l["id"] for l in entities[0]["links"]] == [1]
    assert [a["asset_id"] for a in entities[0]["assets"]] == [1]
    assert profile["socials"] == []


def test_another_users_links_and_assets_are_ignored():
    conn = FakeConn(
        users=[_user()],
        entities=[_entity(1)],
        links=[_link(1, 1), _link(2, 1, user=OTHER_USER), _link(3, None, user=OTHER_USER)],
        assets=[_asset(1, 1), _asset(2, 1, user=OTHER_USER)],
    )
    profile, entities = _run(conn)
    assert [l["id"] for l in entities[0]["links"]] == [1]
    assert [a["asset_id"] for a in entities[0]["assets"]] == [1]
    assert profile["socials"] == []


def test_null_text_in_links_and_assets_becomes_empty_strings():
    conn = FakeConn(
        users=[_user()],
        entities=[_entity(1)],
        links=[_link(1, 1, title=None, link=None, description=None), _link(2, None, description=None)],
        assets=[_asset(1, 1, title=None, description=None)],
    )
    profile, entities = _run(conn)
    link = entities[0]["links"][0]
    assert link["title"] == "" and link["link"] == "" and link["description"] == ""
    assert profile["socials"][0]["description"] == ""
    asset = entities[0]["assets"][0]
    assert asset["title"] == "" and asset["description"] == ""


def test_links_and_assets_keep_database_order():
    conn = FakeConn(
        users=[_user()],
        entities=[_entity(1)],
        links=[_link(30, 1), _link(10, 1), _link(20, 1)],
        assets=[_asset(9, 1), _asset(4, 1)],
    )
    _, entities = _run(conn)
    assert [l["id"] for l in entities[0]["links"]] == [10, 20, 30]
    assert [a["asset_id"] for a in entities[0]["assets"]] == [4, 9]


def test_mock_fallback_has_socials_as_a_list_and_links_and_assets_on_entities():
    async def no_connection():
        return None

    original = db.get_db_connection
    db.get_db_connection = no_connection
    try:
        profile, entities = asyncio.run(db.fetch_user_re_data(USER))
    finally:
        db.get_db_connection = original

    assert isinstance(profile["socials"], list)
    assert all(set(s) == {"id", "title", "link", "description"} for s in profile["socials"])
    assert all("links" in e and "assets" in e for e in entities)
