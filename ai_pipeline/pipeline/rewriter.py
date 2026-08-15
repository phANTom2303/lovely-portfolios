def rewrite_and_build_portfolio(scored_entities: list, jd_extraction: dict, user_profile: dict) -> dict:
    """
    STUB - Returns hardcoded portfolio JSON.
    Real implementation: single Groq LLM call that rewrites entity descriptions
    to foreground JD-relevant skills, returns complete portfolio JSON.
    """
    return {
        "jobRole": "Backend Developer Intern",
        "generatedAt": "2026-08-15T00:00:00Z",
        "profile": {
            "name": "Demo User",
            "professionalTitle": "Backend Developer",
            "about": "Passionate backend developer with experience in Python and REST APIs",
            "currentLocation": "Bhubaneswar, India",
            "socials": []
        },
        "sections": [
            {
                "reType": "project",
                "sectionTitle": "Projects",
                "entities": [
                    {
                        "reId": 2,
                        "title": "REST API for College ERP",
                        "description": "Designed and implemented a scalable REST API using FastAPI and PostgreSQL, enabling seamless data management for a college management system. Focused on clean architecture and efficient database queries.",
                        "skills": ["python", "fastapi", "postgresql"],
                        "links": [],
                        "assets": [],
                        "fromDate": "2024-06-01",
                        "toDate": "2024-08-01"
                    }
                ]
            },
            {
                "reType": "work_exp",
                "sectionTitle": "Work Experience",
                "entities": [
                    {
                        "reId": 3,
                        "title": "Backend Intern at Startup",
                        "description": "Built and maintained Node.js microservices with REST API integrations, contributing to a production backend system. Gained hands-on experience with Redis caching and service-to-service communication.",
                        "skills": ["nodejs", "rest apis", "redis"],
                        "links": [],
                        "assets": [],
                        "fromDate": "2023-06-01",
                        "toDate": "2023-08-01"
                    }
                ]
            }
        ]
    }