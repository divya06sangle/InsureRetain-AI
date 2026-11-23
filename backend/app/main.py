import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from app.schemas import PolicyInput, PredictionResponse
from app.ml_service import MLService
from app.agent_service import RetentionAgentService, AgentActionPlan

# Load .env from project root safely
ROOT_ENV = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=ROOT_ENV)

app = FastAPI(
    title="InsureRetain AI — Policy Lapse & Retention API",
    version="1.0.0",
    description="Predicts life insurance policy lapse risk with SHAP explainability and Gemini AI retention workflows.",
)

allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

ml_service = MLService()
agent_service = RetentionAgentService()


class FullAnalysisResponse(BaseModel):
    prediction: PredictionResponse
    agent_plan: AgentActionPlan


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": True,
        "gemini_configured": agent_service.client is not None,
    }


@app.get("/api/model-info")
def model_info():
    return ml_service.get_model_info()


@app.post("/api/predict", response_model=PredictionResponse)
def predict_lapse_risk(policy: PolicyInput):
    """Fast ML-only endpoint used for real-time What-If slider updates."""
    return ml_service.predict(policy)


@app.post("/api/analyze-and-act", response_model=FullAnalysisResponse)
def analyze_and_act(policy: PolicyInput):
    """Full pipeline: ML Prediction + SHAP Drivers + Gemini Agent Retention Plan."""
    prediction = ml_service.predict(policy)
    agent_plan = agent_service.generate_retention_plan(policy, prediction)
    return FullAnalysisResponse(prediction=prediction, agent_plan=agent_plan)