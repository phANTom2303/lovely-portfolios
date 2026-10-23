from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pipeline.jd_extractor import extract_jd
from pipeline.skill_normalizer import normalize_skills, normalize_jd
from pipeline.scorer import score_and_rank
from pipeline.rewriter import rewrite_and_build_portfolio
from db import fetch_user_re_data_sync

app =FastAPI(title="Lovely Portfolio AI Service")

class GenerateRequest(BaseModel):
    user_id: str
    jd_text: str

@app.get("/")
def health_check():
    return {"status": "ok", "service": "lovely-portfolio-ai"}

@app.post("/api/generate-portfolio")
def generate_portfolio(request: GenerateRequest):
    try:
        user_profile, user_entities = fetch_user_re_data_sync(request.user_id)
        jd_data = normalize_jd(extract_jd(request.jd_text))
        normalized = normalize_skills(user_entities, jd_data)
        scored = score_and_rank(normalized, jd_data)
        portfolio = rewrite_and_build_portfolio(scored, jd_data, user_profile)
        return {"portfolio_json": portfolio}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))