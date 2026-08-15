from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pipeline.jd_extractor import extract_jd
from pipeline.skill_normalizer import normalize_skills
from pipeline.scorer import score_and_rank
from pipeline.rewriter import rewrite_and_build_portfolio

app = FastAPI(title="Lovely Portfolio AI Service")

class GenerateRequest(BaseModel):
    user_id: str
    jd_text: str

@app.get("/")
def health_check():
    return {"status": "ok", "service": "lovely-portfolio-ai"}

@app.post("/api/generate-portfolio")
def generate_portfolio(request: GenerateRequest):
    try:
        jd_data = extract_jd(request.jd_text)
        normalized = normalize_skills([], jd_data)
        scored = score_and_rank(normalized, jd_data)
        portfolio = rewrite_and_build_portfolio(scored, jd_data, {})
        return {"portfolio_json": portfolio}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))