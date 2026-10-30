"""FastAPI backend for the two-tier endometriosis risk predictor.

Run from the project root:
    uvicorn app.main:app --reload
Docs: http://127.0.0.1:8000/docs
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from . import config
from .predictor import Predictor
from .schemas import (
    DISCLAIMER, FIELD_TO_FEATURE, TRAINING_RANGES, HealthResponse, PatientInput, PredictionResponse,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Fail fast at startup if a model or scaler file is missing.
    app.state.predictor = Predictor()
    yield


app = FastAPI(
    title="Endometriosis Risk Predictor API",
    description="Two-tier screening pipeline: symptoms first, then CA-125/CRP labs. " + DISCLAIMER,
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse, tags=["meta"])
def health(request: Request):
    return {"status": "ok", "models": request.app.state.predictor.info()}


@app.get("/schema", tags=["meta"])
def input_schema():
    """Field list for building the frontend form (training ranges and which tier uses each field)."""
    fields = []
    for api_name, feature in FIELD_TO_FEATURE.items():
        rng = TRAINING_RANGES.get(feature)
        fields.append({
            "name": api_name,
            "tier": 2 if api_name in ("ca_125_level", "crp_level") else 1,
            "required": api_name not in ("ca_125_level", "crp_level"),
            "type": "binary" if rng is None else "number",
            "training_range": list(rng) if rng else [0, 1],
        })
    return {"fields": fields, "disclaimer": DISCLAIMER}


@app.post("/predict", response_model=PredictionResponse, tags=["prediction"])
def predict(patient: PatientInput, request: Request):
    """Run Tier 1; if elevated and labs are supplied, also run Tier 2."""
    result = request.app.state.predictor.run(patient.to_feature_dict())
    return result
