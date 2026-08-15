def extract_jd(jd_text: str) -> dict:
    """
    STUB - Returns hardcoded JD extraction output.
    Real implementation: calls Groq API to extract structured data from raw JD text.
    """
    return {
        "jobRole": "Backend Developer Intern",
        "mustHaveSkills": ["python", "fastapi", "postgresql", "rest apis"],
        "preferredSkills": ["docker", "redis"],
        "goodToHaveSkills": ["aws", "kubernetes"],
        "responsibilities": [
            "build and maintain microservices",
            "write unit tests",
            "work with relational databases"
        ],
        "domainKeywords": ["backend", "api", "database", "microservices"],
        "experienceLevel": "fresher"
    }