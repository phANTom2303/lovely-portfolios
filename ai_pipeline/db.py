import json
import uuid
from typing import Any, Dict, List, Optional, Tuple
import asyncpg

from config import DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER, DATABASE_URL

# Fallback mock data when DB is not running locally
MOCK_USER_PROFILE = {
    "name": "Demo User",
    "professionalTitle": "Full Stack & Backend Developer",
    "about": "Computer Science engineer passionate about building high-throughput distributed APIs.",
    "currentLocation": "Bhubaneswar, India",
    "socials": [
        {"id": 1, "title": "GitHub", "link": "https://github.com/phANTom2303", "description": ""},
        {"id": 2, "title": "LinkedIn", "link": "https://linkedin.com", "description": ""},
    ],
}

MOCK_USER_ENTITIES = [
    {
        "reId": 1,
        "reType": "project",
        "title": "Share Market Tracker",
        "subtitle": "Personal Project",
        "description": "Built a real time stock price tracker with live data feeds using WebSockets and Node.js.",
        "originalSkills": ["JS", "Node", "Postgres"],
        "fromDate": "2024-01-01",
        "toDate": "2024-05-01",
        "links": [],
        "assets": [],
    },
    {
        "reId": 2,
        "reType": "project",
        "title": "REST API for College ERP",
        "subtitle": "Academic Project",
        "description": "Designed and built a modular REST API for college management system with automated student grade calculation.",
        "originalSkills": ["Python", "FastAPI", "PostgreSQL"],
        "fromDate": "2024-06-01",
        "toDate": "2024-08-01",
        "links": [],
        "assets": [],
    },
    {
        "reId": 3,
        "reType": "work_exp",
        "title": "Backend Intern at Startup",
        "subtitle": "Startup",
        "description": "Worked on Node.js microservices and REST APIs with Redis caching layer.",
        "originalSkills": ["Node.js", "REST APIs", "Redis"],
        "fromDate": "2023-06-01",
        "toDate": "2023-08-01",
        "links": [],
        "assets": [],
    },
]


class InvalidUserId(ValueError):
    """user_id is not a valid UUID — the caller's mistake."""


class UserNotFound(LookupError):
    """No user with this id exists."""


class NoResumeEntities(LookupError):
    """The user exists but has no active resume entities to build a portfolio from."""


def _parse_user_id(user_id: str) -> uuid.UUID:
    """Validate that user_id is a UUID (users.id is UUID in the schema)."""
    try:
        return uuid.UUID(str(user_id))
    except ValueError:
        raise InvalidUserId(f"Invalid user_id (expected a UUID): {user_id!r}")


def _link_item(row) -> Dict[str, Any]:
    """One links row -> the item shape used in entity['links'] and profile['socials'] (schema column names)."""
    return {
        "id": row["id"],
        "title": row["title"] or "",
        "link": row["link"] or "",
        "description": row["description"] or "",
    }


def _asset_item(row) -> Dict[str, Any]:
    """One assets row -> the item shape used in entity['assets'] (schema column names).
    cloudinary_public_id is an internal deletion key and is deliberately not exposed."""
    return {
        "asset_id": row["asset_id"],
        "title": row["title"] or "",
        "link": row["link"] or "",
        "description": row["description"] or "",
        "asset_type": str(row["asset_type"]) if row["asset_type"] is not None else None,
    }


async def get_db_connection():
    """Establish async connection to PostgreSQL."""
    try:
        conn = await asyncpg.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            timeout=5.0,
        )
        return conn
    except Exception as e:
        print(f"[db] Warning: Could not connect to PostgreSQL ({e}). Using mock/fallback data.")
        return None


async def fetch_user_re_data(user_id: str) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    """
    Fetches user profile and active resume entities (with resolved skill names) from PostgreSQL.
    Falls back gracefully if the database is unreachable.
    """
    uid = _parse_user_id(user_id)

    conn = await get_db_connection()
    if conn is None:
        return MOCK_USER_PROFILE, MOCK_USER_ENTITIES

    try:
        # 1. Fetch user profile
        user_row = await conn.fetchrow(
            """
            SELECT id, name, professional_title, about, current_location
            FROM users
            WHERE id = $1
            """,
            uid,
        )
        if user_row is None:
            raise UserNotFound(f"User not found: {user_id}")

        user_profile = {
            "name": user_row["name"] or "Candidate",
            "professionalTitle": user_row["professional_title"] or "Software Developer",
            "about": user_row["about"] or "",
            "currentLocation": user_row["current_location"] or "India",
            "socials": [],
        }

        # 2. Fetch active resume entities
        entity_rows = await conn.fetch(
            """
            SELECT re_id, re_type, title, subtitle, description, from_date, to_date
            FROM resume_entity
            WHERE user_id = $1
              AND status = 'active'
            ORDER BY from_date DESC NULLS LAST
            """,
            uid,
        )

        if not entity_rows:
            raise NoResumeEntities(f"User {user_id} has no active resume entities")

        # 3. Fetch the skills of these entities. Each skills row belongs to one entity (re_id);
        #    rows with re_id NULL are profile-level skills and are not matched by ANY().
        skill_rows = await conn.fetch(
            """
            SELECT re_id, skill_name
            FROM skills
            WHERE user_id = $1
              AND re_id = ANY($2::int[])
            ORDER BY skill_id
            """,
            uid,
            [r["re_id"] for r in entity_rows],
        )

        skills_by_entity: Dict[int, List[str]] = {}
        for sr in skill_rows:
            skills_by_entity.setdefault(sr["re_id"], []).append(sr["skill_name"])

        # 4. Fetch links and assets of this user in one query each. A row with re_id NULL is
        #    profile-level: links become the profile's socials, assets are not used yet.
        link_rows = await conn.fetch(
            """
            SELECT id, re_id, title, link, description
            FROM links
            WHERE user_id = $1
            ORDER BY id
            """,
            uid,
        )
        asset_rows = await conn.fetch(
            """
            SELECT asset_id, re_id, title, link, description, asset_type
            FROM assets
            WHERE user_id = $1
            ORDER BY asset_id
            """,
            uid,
        )

        links_by_entity: Dict[int, List[Dict[str, Any]]] = {}
        for lr in link_rows:
            if lr["re_id"] is None:
                user_profile["socials"].append(_link_item(lr))
            else:
                links_by_entity.setdefault(lr["re_id"], []).append(_link_item(lr))

        assets_by_entity: Dict[int, List[Dict[str, Any]]] = {}
        for ar in asset_rows:
            if ar["re_id"] is not None:
                assets_by_entity.setdefault(ar["re_id"], []).append(_asset_item(ar))

        entities = []
        for r in entity_rows:
            entities.append(
                {
                    "reId": r["re_id"],
                    "reType": str(r["re_type"]),
                    "title": r["title"] or "",
                    "subtitle": r["subtitle"] or "",
                    "description": r["description"] or "",
                    "originalSkills": skills_by_entity.get(r["re_id"], []),
                    "fromDate": str(r["from_date"]) if r["from_date"] else None,
                    "toDate": str(r["to_date"]) if r["to_date"] else None,
                    "links": links_by_entity.get(r["re_id"], []),
                    "assets": assets_by_entity.get(r["re_id"], []),
                }
            )

        return user_profile, entities

    finally:
        await conn.close()


async def save_portfolio(
    user_id: str, job_role: str, jd_text: str, portfolio_json: dict
) -> str:
    """
    Saves generated portfolio JSON to PostgreSQL 'portfolios' table.
    Expects the table to be managed and created by the backend database migrations.
    """
    uid = _parse_user_id(user_id)

    conn = await get_db_connection()
    if conn is None:
        portfolio_id = str(uuid.uuid4())
        print(f"[db] DB offline. Simulated portfolio save with ID: {portfolio_id}")
        return portfolio_id

    try:
        # Directly insert portfolio into backend-managed portfolios table
        inserted_id = await conn.fetchval(
            """
            INSERT INTO portfolios (user_id, job_role, jd_text, portfolio_json)
            VALUES ($1, $2, $3, $4::jsonb)
            RETURNING portfolio_id
            """,
            uid,
            job_role,
            jd_text,
            json.dumps(portfolio_json),
        )
        if not inserted_id:
            raise RuntimeError("Database did not return a generated portfolio_id.")
        return str(inserted_id)

    except Exception as e:
        print(f"[db] Error inserting into portfolios table: {e}")
        raise RuntimeError(f"Database error while saving portfolio: {e}")

    finally:
        await conn.close()


def fetch_user_re_data_sync(user_id: str) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    """Synchronous wrapper for fetch_user_re_data."""
    import asyncio
    return asyncio.run(fetch_user_re_data(user_id))


def save_portfolio_sync(
    user_id: str, job_role: str, jd_text: str, portfolio_json: dict
) -> str:
    """Synchronous wrapper for save_portfolio."""
    import asyncio
    return asyncio.run(save_portfolio(user_id, job_role, jd_text, portfolio_json))
