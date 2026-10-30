"""Loads both tiers once and runs the two-tier pipeline (same logic as predict.py)."""

from dataclasses import dataclass

import joblib
import pandas as pd
import sklearn

from . import config  # must come first: it puts the ML folder on sys.path
from .schemas import TRAINING_RANGES

try:
    from prediction_explanation import explain_pipeline, explain_tier1, explain_tier2
except ModuleNotFoundError as exc:  # pragma: no cover
    raise ModuleNotFoundError(
        f"prediction_explanation.py not found in {config.ML_DIR}. "
        "Set ENDO_ML_DIR to the folder that contains it, models/ and data/processed/."
    ) from exc

LAB_FEATURES = ("CA_125_Level", "CRP_Level")

NEXT_STEP_TEXT = {
    "no_action": "Low home-symptom risk. No lab follow-up recommended at this time.",
    "order_lab_kit": (
        "Elevated home-symptom risk. Recommend a CA-125/CRP blood test to refine this "
        "estimate before seeing a doctor."
    ),
    "see_doctor": (
        "Tier 2 model indicates elevated predicted risk. Recommend seeing a doctor for "
        "clinical evaluation."
    ),
    "monitor_symptoms": (
        "Tier 2 model indicates lower predicted risk. Monitor symptoms and see a doctor "
        "if they persist or worsen."
    ),
}


@dataclass
class TierModel:
    name: str
    model_name: str
    model: object
    scaler: object
    feature_names: list

    def predict_proba(self, patient: dict) -> float:
        row = pd.DataFrame([{f: patient[f] for f in self.feature_names}])
        scaled = pd.DataFrame(self.scaler.transform(row), columns=self.feature_names)
        return float(self.model.predict_proba(scaled)[0, 1])


def _load_tier(tier: str) -> TierModel:
    model_path = config.MODEL_DIR / f"{tier}_model.pkl"
    scaler_path = config.PROCESSED_DIR / tier / "scaler.pkl"
    missing = [str(p) for p in (model_path, scaler_path) if not p.exists()]
    if missing:
        raise FileNotFoundError(
            "Missing model files:\n  " + "\n  ".join(missing)
            + f"\nLooked for the ML folder at {config.ML_DIR}. "
            "Set ENDO_ML_DIR to the folder that contains models/ and data/processed/."
        )
    bundle = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    return TierModel(tier, bundle["model_name"], bundle["model"], scaler, bundle["feature_names"])


class Predictor:
    def __init__(self, threshold: float = config.THRESHOLD,
                 run_tier2_when_labs: bool = config.RUN_TIER2_WHEN_LABS_PROVIDED):
        self.threshold = threshold
        self.run_tier2_when_labs = run_tier2_when_labs
        self.tier1 = _load_tier("tier1")
        self.tier2 = _load_tier("tier2")

    def info(self) -> dict:
        return {
            "sklearn_version": sklearn.__version__,
            "threshold": self.threshold,
            "run_tier2_when_labs_provided": self.run_tier2_when_labs,
            "tier1": {"model": self.tier1.model_name, "n_features": len(self.tier1.feature_names)},
            "tier2": {"model": self.tier2.model_name, "n_features": len(self.tier2.feature_names)},
        }

    @staticmethod
    def range_warnings(patient: dict) -> list:
        warnings = []
        for feature, (lo, hi) in TRAINING_RANGES.items():
            value = patient.get(feature)
            if value is not None and not (lo <= value <= hi):
                warnings.append(
                    f"{feature} = {value:g} is outside the training range ({lo:g}-{hi:g}); "
                    "the prediction is less reliable."
                )
        return warnings

    def run(self, patient: dict) -> dict:
        """patient: dict keyed by dataset column names. Labs are optional."""
        warnings = self.range_warnings(patient)
        have_labs = all(patient.get(f) is not None for f in LAB_FEATURES)

        p1 = self.tier1.predict_proba(patient)
        flagged = p1 >= self.threshold
        result = {
            "tier1": {"probability": p1, "elevated_risk": flagged},
            "tier2": None,
            "warnings": warnings,
            "threshold": self.threshold,
        }

        run_tier2 = have_labs and (flagged or self.run_tier2_when_labs)

        if have_labs and not run_tier2:
            warnings.append(
                "Lab values were provided but not used: Tier 2 only runs after an elevated Tier 1 result."
            )

        if run_tier2:
            p2 = self.tier2.predict_proba(patient)
            result["tier2"] = {"probability": p2, "elevated_risk": p2 >= self.threshold}
            next_step = "see_doctor" if p2 >= self.threshold else "monitor_symptoms"
        else:
            next_step = "order_lab_kit" if flagged else "no_action"

        result["next_step"] = next_step
        result["recommendation"] = NEXT_STEP_TEXT[next_step]
        result["explanation"] = self._explain(result, flagged)
        return result

    def _explain(self, result: dict, flagged: bool) -> str:
        p1 = result["tier1"]["probability"]
        p2 = result["tier2"]["probability"] if result["tier2"] else None
        if p2 is not None and not flagged:
            # Labs-after-low-Tier-1 case isn't covered by explain_pipeline.
            return "\n\n".join([explain_tier1(p1, self.threshold), explain_tier2(p2, self.threshold)])
        return explain_pipeline(
            {"tier1_probability": p1, "tier1_flagged": flagged, "tier2_probability": p2},
            self.threshold,
        )
