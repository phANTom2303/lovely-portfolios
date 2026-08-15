def score_and_rank(normalized_entities: list, jd_extraction: dict) -> list:
    """
    STUB - Returns hardcoded scored and ranked entities.
    Real implementation: single Groq LLM call that scores all entities
    against the JD semantically and returns ranked selection.
    """
    return [
        {
            "reId": 2,
            "reType": "project",
            "title": "REST API for College ERP",
            "description": "Designed and built a REST API for college management system",
            "normalizedSkills": ["python", "fastapi", "postgresql"],
            "fromDate": "2024-06-01",
            "toDate": "2024-08-01",
            "score": 0.92,
            "reasoning": "Directly matches must-have skills: python, fastapi, postgresql"
        },
        {
            "reId": 3,
            "reType": "work_exp",
            "title": "Backend Intern at Startup",
            "description": "Worked on Node.js microservices and REST APIs",
            "normalizedSkills": ["nodejs", "rest apis", "redis"],
            "fromDate": "2023-06-01",
            "toDate": "2023-08-01",
            "score": 0.78,
            "reasoning": "Matches preferred skills and responsibilities around microservices"
        },
        {
            "reId": 1,
            "reType": "project",
            "title": "Share Market Tracker",
            "description": "Built a real time stock price tracker with live data feeds",
            "normalizedSkills": ["javascript", "nodejs", "postgresql"],
            "fromDate": "2024-01-01",
            "toDate": "2024-05-01",
            "score": 0.61,
            "reasoning": "Partial match on postgresql and nodejs"
        }
    ]