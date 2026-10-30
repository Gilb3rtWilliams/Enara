import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.predictor import Predictor

SYMPTOMS_HIGH = {
    "age": 29, "bmi": 24.5, "cycle_length": 26, "age_of_menarche": 12,
    "dysmenorrhea_score": 8, "pelvic_pain_score": 7, "dyspareunia_score": 6,
    "dyschezia_score": 6, "urinary_symptoms_score": 5,
    "family_history": 1, "infertility_status": 1, "mental_health_score": 4,
}
SYMPTOMS_LOW = {**SYMPTOMS_HIGH, "dysmenorrhea_score": 0, "pelvic_pain_score": 0,
                "dyspareunia_score": 0, "dyschezia_score": 0, "urinary_symptoms_score": 0,
                "family_history": 0, "infertility_status": 0}


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200 and r.json()["status"] == "ok"


def test_schema(client):
    fields = client.get("/schema").json()["fields"]
    assert len(fields) == 14 and sum(f["required"] for f in fields) == 12


def test_tier1_high_recommends_lab_kit(client):
    body = client.post("/predict", json=SYMPTOMS_HIGH).json()
    assert body["tier1"]["elevated_risk"] is True
    assert body["tier2"] is None
    assert body["next_step"] == "order_lab_kit"
    assert abs(body["tier1"]["probability"] - 0.879) < 0.01  # matches predict.py --demo


def test_tier1_low_no_action(client):
    body = client.post("/predict", json=SYMPTOMS_LOW).json()
    assert body["tier1"]["elevated_risk"] is False
    assert body["next_step"] == "no_action"


def test_tier2_runs_with_labs(client):
    r = client.post("/predict", json={**SYMPTOMS_HIGH, "ca_125_level": 160, "crp_level": 16})
    body = r.json()
    assert body["tier2"]["elevated_risk"] is True
    assert body["next_step"] == "see_doctor"
    r = client.post("/predict", json={**SYMPTOMS_HIGH, "ca_125_level": 30, "crp_level": 2})
    assert r.json()["next_step"] == "monitor_symptoms"


def test_labs_ignored_after_low_tier1_by_default(client):
    body = client.post("/predict", json={**SYMPTOMS_LOW, "ca_125_level": 180, "crp_level": 18}).json()
    assert body["tier2"] is None
    assert any("not used" in w for w in body["warnings"])


def test_labs_used_after_low_tier1_when_configured():
    p = Predictor(run_tier2_when_labs=True)
    res = p.run({"Age": 29, "BMI": 24.5, "Cycle_Length": 26, "Age_of_Menarche": 12,
                 "Dysmenorrhea_Score": 0, "Pelvic_Pain_Score": 0, "Dyspareunia_Score": 0,
                 "Dyschezia_Score": 0, "Urinary_Symptoms_Score": 0, "Family_History": 0,
                 "Infertility_Status": 0, "Mental_Health_Score": 4,
                 "CA_125_Level": 180, "CRP_Level": 18})
    assert res["tier2"] is not None and "TIER 2" in res["explanation"]


def test_only_one_lab_rejected(client):
    assert client.post("/predict", json={**SYMPTOMS_HIGH, "ca_125_level": 100}).status_code == 422


@pytest.mark.parametrize("patch", [
    {"dysmenorrhea_score": 11}, {"age": 5}, {"family_history": 2}, {"bmi": "abc"}, {"unknown": 1},
])
def test_invalid_input_rejected(client, patch):
    assert client.post("/predict", json={**SYMPTOMS_HIGH, **patch}).status_code == 422


def test_missing_field_rejected(client):
    body = {k: v for k, v in SYMPTOMS_HIGH.items() if k != "age"}
    assert client.post("/predict", json=body).status_code == 422


def test_out_of_training_range_warns(client):
    body = client.post("/predict", json={**SYMPTOMS_HIGH, "age": 55}).json()
    assert any("Age" in w for w in body["warnings"])


def test_booleans_accepted_for_binary_fields(client):
    r = client.post("/predict", json={**SYMPTOMS_HIGH, "family_history": True, "infertility_status": False})
    assert r.status_code == 200
