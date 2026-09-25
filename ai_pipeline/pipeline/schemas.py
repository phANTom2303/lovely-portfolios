from typing import Literal

from pydantic import BaseModel

# "" means the JD doesn't state or imply an experience level.
ExperienceLevel = Literal["fresher", "junior", "mid", "senior", ""]


class JDExtraction(BaseModel):
    """Structured output of Step 1 (JD extraction). Mirrors prompts/extraction_prompt.txt."""

    jobRole: str
    mustHaveSkills: list[str] = []
    preferredSkills: list[str] = []
    goodToHaveSkills: list[str] = []
    responsibilities: list[str] = []
    domainKeywords: list[str] = []
    experienceLevel: ExperienceLevel = ""
