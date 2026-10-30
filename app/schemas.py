"""Request/response models and the mapping from API field names to dataset columns."""

from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator

# API field name -> dataset column name the models were trained on.
FIELD_TO_FEATURE = {
    "age": "Age",
    "bmi": "BMI",
    "cycle_length": "Cycle_Length",
    "age_of_menarche": "Age_of_Menarche",
    "dysmenorrhea_score": "Dysmenorrhea_Score",
    "pelvic_pain_score": "Pelvic_Pain_Score",
    "dyspareunia_score": "Dyspareunia_Score",
    "dyschezia_score": "Dyschezia_Score",
    "urinary_symptoms_score": "Urinary_Symptoms_Score",
    "family_history": "Family_History",
    "infertility_status": "Infertility_Status",
    "mental_health_score": "Mental_Health_Score",
    "ca_125_level": "CA_125_Level",
    "crp_level": "CRP_Level",
}

# Range seen in the training data, used to warn when an input is outside what
# the model has learned from (it would be extrapolating).
TRAINING_RANGES = {
    "Age": (18, 44),
    "BMI": (18.0, 35.0),
    "Cycle_Length": (21, 34),
    "Age_of_Menarche": (10, 15),
    "Dysmenorrhea_Score": (0, 10),
    "Pelvic_Pain_Score": (0, 10),
    "Dyspareunia_Score": (0, 10),
    "Dyschezia_Score": (0, 10),
    "Urinary_Symptoms_Score": (0, 10),
    "Mental_Health_Score": (0, 10),
    "CA_125_Level": (10.0, 200.0),
    "CRP_Level": (0.0, 20.0),
}

DISCLAIMER = (
    "This is a screening prediction from a model trained on a synthetic dataset. "
    "It is not a medical diagnosis and is not a substitute for professional medical advice."
)


class PatientInput(BaseModel):
    """Tier 1 symptom inputs (required) plus optional Tier 2 lab values."""

    model_config = ConfigDict(
        extra="forbid",
        json_schema_extra={
            "example": {
                "age": 29, "bmi": 24.5, "cycle_length": 26, "age_of_menarche": 12,
                "dysmenorrhea_score": 8, "pelvic_pain_score": 7, "dyspareunia_score": 6,
                "dyschezia_score": 6, "urinary_symptoms_score": 5,
                "family_history": 1, "infertility_status": 1, "mental_health_score": 4,
            }
        },
    )

    # Hard limits reject nonsense input; values outside the training range but
    # inside these limits are accepted with a warning.
    age: float = Field(ge=10, le=70)
    bmi: float = Field(ge=10, le=70)
    cycle_length: float = Field(ge=10, le=90, description="Days")
    age_of_menarche: float = Field(ge=7, le=20, description="Age at first period")
    dysmenorrhea_score: float = Field(ge=0, le=10, description="Period pain, 0-10")
    pelvic_pain_score: float = Field(ge=0, le=10)
    dyspareunia_score: float = Field(ge=0, le=10, description="Pain during sex, 0-10")
    dyschezia_score: float = Field(ge=0, le=10, description="Painful bowel movements, 0-10")
    urinary_symptoms_score: float = Field(ge=0, le=10)
    family_history: Literal[0, 1] = Field(description="Family history of endometriosis (0 = no, 1 = yes)")
    infertility_status: Literal[0, 1] = Field(description="Current infertility (0 = no, 1 = yes)")
    mental_health_score: float = Field(ge=0, le=10)

    # Optional lab values from a CA-125 / CRP test (Tier 2).
    ca_125_level: Optional[float] = Field(default=None, ge=0, le=2000)
    crp_level: Optional[float] = Field(default=None, ge=0, le=500)

    @model_validator(mode="after")
    def labs_all_or_nothing(self):
        if (self.ca_125_level is None) != (self.crp_level is None):
            raise ValueError("Provide both ca_125_level and crp_level, or neither.")
        return self

    def to_feature_dict(self) -> dict:
        """Dataset-column-keyed dict (drops labs that were not provided)."""
        data = self.model_dump()
        return {FIELD_TO_FEATURE[k]: v for k, v in data.items() if v is not None}


class TierResult(BaseModel):
    probability: float = Field(description="Predicted probability (0-1)")
    elevated_risk: bool


class PredictionResponse(BaseModel):
    tier1: TierResult
    tier2: Optional[TierResult] = None
    next_step: Literal["no_action", "order_lab_kit", "see_doctor", "monitor_symptoms"]
    recommendation: str
    explanation: str
    warnings: list[str]
    threshold: float
    disclaimer: str = DISCLAIMER


class HealthResponse(BaseModel):
    status: Literal["ok"]
    models: dict
