import logging

from fastapi import FastAPI, HTTPException
from groq import APIError as GroqAPIError
from pydantic import BaseModel, ValidationError
from pipeline.jd_extractor import extract_jd
from pipeline.skill_normalizer import normalize_skills, normalize_jd
from pipeline.scorer import score_and_rank
from pipeline.rewriter import rewrite_and_build_portfolio
from db import fetch_user_re_data_sync, InvalidUserId, UserNotFound, NoResumeEntities

logger = logging.getLogger("lovely-portfolio-ai")

app =FastAPI(title="Lovely Portfolio AI Service")

class GenerateRequest(BaseModel):
    user_id: str
    jd_text: str

@app.get("/")
def health_check():
    return {"status": "ok", "service": "lovely-portfolio-ai"}

@app.post("/api/generate-portfolio")
def generate_portfolio(request: GenerateRequest):
    if not request.jd_text.strip():
        raise HTTPException(status_code=400, detail="jd_text must not be empty")

    # 4xx = the caller can fix it, 502 = the LLM provider failed, 500 = our own bug.
    # The detail sent to the client is always a clean message; the real error is logged.
    try:
        user_profile, user_entities = fetch_user_re_data_sync(request.user_id)
        jd_data = normalize_jd(extract_jd(request.jd_text))
        normalized = normalize_skills(user_entities, jd_data)
        try:
            scored = score_and_rank(normalized, jd_data)
        except ValueError as e:
            # The scorer raises this when no entity fits the JD at all.
            # ValidationError is also a ValueError, so let LLM failures pass through.
            if isinstance(e, ValidationError):
                raise
            raise HTTPException(status_code=422, detail=str(e))
        portfolio = rewrite_and_build_portfolio(scored, jd_data, user_profile)
        return {"portfolio_json": portfolio}

    except InvalidUserId as e:
        raise HTTPException(status_code=400, detail=str(e))
    except UserNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except NoResumeEntities as e:
        raise HTTPException(status_code=422, detail=str(e))
    except HTTPException:
        raise
    except (GroqAPIError, ValidationError, RuntimeError):
        logger.exception("LLM step failed for user %s", request.user_id)
        raise HTTPException(status_code=502, detail="The AI provider failed to produce a valid result. Please try again.")
    except Exception:
        logger.exception("Unexpected error for user %s", request.user_id)
        raise HTTPException(status_code=500, detail="Internal server error")
