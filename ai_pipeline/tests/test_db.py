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

    def __init__(self, users=(), entities=(), skills=()):
        self.users = list(users)
        self.entities = list(entities)
        self.skills = list(skills)
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
