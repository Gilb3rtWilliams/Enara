"""Runtime configuration for the API. Override via environment variables."""

import os
import sys
from pathlib import Path

# Folder that contains the app/ package (the folder you run uvicorn from).
PROJECT_ROOT = Path(__file__).resolve().parent.parent


def _find_ml_dir() -> Path:
    """Folder holding models/, data/processed/ and prediction_explanation.py.

    Order: ENDO_ML_DIR env var, then the project root itself, then ./ML next to app/.
    """
    env = os.getenv("ENDO_ML_DIR")
    if env:
        return Path(env).expanduser().resolve()
    for candidate in (PROJECT_ROOT, PROJECT_ROOT / "ML", PROJECT_ROOT / "ml"):
        if (candidate / "models" / "tier1_model.pkl").exists():
            return candidate
    return PROJECT_ROOT / "ML"  # nothing found; Predictor reports exactly what is missing


ML_DIR = _find_ml_dir()
MODEL_DIR = ML_DIR / "models"
PROCESSED_DIR = ML_DIR / "data" / "processed"

# prediction_explanation.py lives in ML_DIR. Appended (not prepended) so ML/app/ can
# never shadow this project's own `app` package.
if str(ML_DIR) not in sys.path:
    sys.path.append(str(ML_DIR))

# Probability cutoff used by both tiers (matches predict.py).
THRESHOLD = float(os.getenv("ENDO_THRESHOLD", "0.5"))

# predict.py only runs Tier 2 when Tier 1 flags elevated risk. Set to "true"
# to run Tier 2 whenever lab values are supplied, even after a low Tier 1 score.
RUN_TIER2_WHEN_LABS_PROVIDED = os.getenv("ENDO_RUN_TIER2_WHEN_LABS", "false").lower() == "true"

# Comma-separated list of allowed frontend origins, e.g. "http://localhost:5173,https://myapp.com"
CORS_ORIGINS = [o.strip() for o in os.getenv("ENDO_CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",") if o.strip()]
