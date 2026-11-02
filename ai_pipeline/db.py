import asyncio
import json
import uuid
from typing import Any, Dict, List, Optional, Tuple
import asyncpg

from config import DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER, DATABASE_URL

class InvalidUserId(ValueError):
    """user_id is not a valid UUID — the caller's mistake."""


class UserNotFound(LookupError):
    """No user with this id exists."""


class DatabaseUnavailable(Exception):
    """Could not connect to PostgreSQL: it is down, or the host, port, database or password is wrong.
    The real cause is kept as __cause__ for the logs; callers must not show it to users."""


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
    """Open an async connection to PostgreSQL, or raise DatabaseUnavailable. Never returns fake data."""
    try:
        return await asyncpg.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            timeout=5.0,
        )
    except (OSError, asyncio.TimeoutError, asyncpg.PostgresError, asyncpg.InterfaceError) as e:
        # OSError: refused / unknown host / TLS; PostgresError: wrong password or database name.
        raise DatabaseUnavailable(f"Could not connect to PostgreSQL: {e}") from e


async def fetch_user_re_data(user_id: str) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    """
    Fetches the user's profile and active resume entities (with skills, links and assets) from PostgreSQL.
    Raises DatabaseUnavailable if the database cannot be reached.
    """
    uid = _parse_user_id(user_id)

    conn = await get_db_connection()

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
