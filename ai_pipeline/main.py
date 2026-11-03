import logging

from fastapi import FastAPI, HTTPException
from groq import APIError as GroqAPIError
from pydantic import BaseModel, ValidationError
from db import DatabaseUnavailable, InvalidUserId, PortfolioSaveFailed, UserNotFound, NoResumeEntities
from service import generate_for_user, ProfileMismatch

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

    # 4xx = the caller can fix it, 502 = the LLM provider failed, 503 = our database is down,
    # 500 = our own bug.
    # The detail sent to the client is always a clean message; the real error is logged.
    try:
        return generate_for_user(request.user_id, request.jd_text)

    except InvalidUserId as e:
        raise HTTPException(status_code=400, detail=str(e))
    except UserNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except (NoResumeEntities, ProfileMismatch) as e:
        raise HTTPException(status_code=422, detail=str(e))
    except DatabaseUnavailable:
        logger.exception("Database unavailable while serving user %s", request.user_id)
        raise HTTPException(status_code=503, detail="The database is unavailable. Please try again later.")
    except PortfolioSaveFailed:
        logger.exception("Could not save the portfolio of user %s", request.user_id)
        raise HTTPException(status_code=500, detail="The portfolio was generated but could not be saved. Please try again.")
    except (GroqAPIError, ValidationError, RuntimeError):
        logger.exception("LLM step failed for user %s", request.user_id)
        raise HTTPException(status_code=502, detail="The AI provider failed to produce a valid result. Please try again.")
    except Exception:
        logger.exception("Unexpected error for user %s", request.user_id)
        raise HTTPException(status_code=500, detail="Internal server error")
