def normalize_skills(user_entities: list, jd_extraction: dict) -> list:
    """
    STUB - Returns hardcoded normalized skill matches.
    Real implementation: 3-layer normalization using exact match,
    synonym dictionary, and fuzzy matching (thefuzz).
    """
    return [
        {
            "reId": 1,
            "reType": "project",
            "title": "Share Market Tracker",
            "description": "Built a real time stock price tracker with live data feeds",
            "originalSkills": ["JS", "Node", "Postgres"],
            "normalizedSkills": ["javascript", "nodejs", "postgresql"],
            "fromDate": "2024-01-01",
            "toDate": "2024-05-01"
        },
        {
            "reId": 2,
            "reType": "project",
            "title": "REST API for College ERP",
            "description": "Designed and built a REST API for college management system",
            "originalSkills": ["Python", "FastAPI", "PostgreSQL"],
            "normalizedSkills": ["python", "fastapi", "postgresql"],
            "fromDate": "2024-06-01",
            "toDate": "2024-08-01"
        },
        {
            "reId": 3,
            "reType": "work_exp",
            "title": "Backend Intern at Startup",
            "description": "Worked on Node.js microservices and REST APIs",
            "originalSkills": ["Node.js", "REST APIs", "Redis"],
            "normalizedSkills": ["nodejs", "rest apis", "redis"],
            "fromDate": "2023-06-01",
            "toDate": "2023-08-01"
        }
    ]