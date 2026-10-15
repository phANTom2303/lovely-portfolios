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
    "socials": {
        "github": "https://github.com/phANTom2303",
        "linkedin": "https://linkedin.com",
    },
}

MOCK_USER_ENTITIES = [
    {
        "reId": 1,
        "reType": "project",
        "title": "Share Market Tracker",
        "description": "Built a real time stock price tracker with live data feeds using WebSockets and Node.js.",
        "originalSkills": ["JS", "Node", "Postgres"],
        "fromDate": "2024-01-01",
        "toDate": "2024-05-01",
    },
    {
        "reId": 2,
        "reType": "project",
        "title": "REST API for College ERP",
        "description": "Designed and built a modular REST API for college management system with automated student grade calculation.",
        "originalSkills": ["Python", "FastAPI", "PostgreSQL"],
        "fromDate": "2024-06-01",
        "toDate": "2024-08-01",
    },
    {
        "reId": 3,
        "reType": "work_exp",
        "title": "Backend Intern at Startup",
        "description": "Worked on Node.js microservices and REST APIs with Redis caching layer.",
        "originalSkills": ["Node.js", "REST APIs", "Redis"],
        "fromDate": "2023-06-01",
        "toDate": "2023-08-01",
    },
]


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
    conn = await get_db_connection()
    if conn is None:
        return MOCK_USER_PROFILE, MOCK_USER_ENTITIES

    try:
        # 1. Fetch user profile
        user_row = await conn.fetchrow(
            """
            SELECT id, name, professional_title, about, current_location
            FROM users
            WHERE id = $1::uuid OR email = $1
            LIMIT 1
            """,
            user_id,
        )

        user_profile = dict(MOCK_USER_PROFILE)
        if user_row:
            user_profile = {
                "name": user_row["name"] or "Candidate",
                "professionalTitle": user_row["professional_title"] or "Software Developer",
                "about": user_row["about"] or "",
                "currentLocation": user_row["current_location"] or "India",
                "socials": {},
            }

        # 2. Fetch active resume entities
        entity_rows = await conn.fetch(
            """
            SELECT re_id, re_type, title, description, skills_id, from_date, to_date
            FROM resume_entity
            WHERE (user_id = $1::uuid OR user_id = (SELECT id FROM users WHERE email = $1 LIMIT 1))
              AND status = 'active'
            ORDER BY from_date DESC NULLS LAST
            """,
            user_id,
        )

        if not entity_rows:
            return user_profile, MOCK_USER_ENTITIES

        # 3. Resolve skill names from skills table
        all_skill_ids = set()
        for r in entity_rows:
            if r["skills_id"]:
                all_skill_ids.update(r["skills_id"])

        skill_map = {}
        if all_skill_ids:
            skill_records = await conn.fetch(
                """
                SELECT skill_id, skill_name
                FROM skills
                WHERE skill_id = ANY($1::int[])
                """,
                list(all_skill_ids),
            )
            skill_map = {sr["skill_id"]: sr["skill_name"] for sr in skill_records}

        entities = []
        for r in entity_rows:
            skills_for_entity = []
            if r["skills_id"]:
                skills_for_entity = [
                    skill_map[sid] for sid in r["skills_id"] if sid in skill_map
                ]

            entities.append(
                {
                    "reId": r["re_id"],
                    "reType": str(r["re_type"]),
                    "title": r["title"] or "",
                    "description": r["description"] or "",
                    "originalSkills": skills_for_entity,
                    "fromDate": str(r["from_date"]) if r["from_date"] else None,
                    "toDate": str(r["to_date"]) if r["to_date"] else None,
                }
            )

        return user_profile, entities

    except Exception as e:
        print(f"[db] Query error: {e}. Falling back to mock data.")
        return MOCK_USER_PROFILE, MOCK_USER_ENTITIES

    finally:
        await conn.close()


async def save_portfolio(
    user_id: str, job_role: str, jd_text: str, portfolio_json: dict
) -> str:
    """
    Saves generated portfolio JSON to PostgreSQL 'portfolios' table.
    Expects the table to be managed and created by the backend database migrations.
    """
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
            VALUES (
                (SELECT id FROM users WHERE id = $1::uuid OR email = $1 LIMIT 1),
                $2,
                $3,
                $4::jsonb
            )
            RETURNING portfolio_id
            """,
            user_id,
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
