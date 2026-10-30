# Endometriosis risk check: frontend

React + Vite single-page app for the FastAPI backend in `../app`.

## Run it

```bash
# 1. backend (from the project root, the folder with models/ and app/)
pip install -r requirements-api.txt
uvicorn app.main:app --reload

# 2. frontend (in a second terminal)
cd frontend
npm install
npm run dev          # http://localhost:5173
```

The backend allows `localhost:5173` by default. To point at another backend, copy `.env.example`
to `.env` and set `VITE_API_URL`; for a deployed frontend, also set `ENDO_CORS_ORIGINS` on the backend.

## How it works

- `src/fields.js`: every question (label, hint, limits) in one place. Edit copy here.
- `src/api.js`: the `POST /predict` call and error messages.
- `src/App.jsx`: intro, four-step form, submit.
- `src/components/Result.jsx`: result screen. If the backend returns `next_step: "order_lab_kit"`,
  it shows the CA-125/CRP form and re-submits with the symptoms plus labs.

## Check before sharing

- The units on the lab fields (CA-125 in U/mL, CRP in mg/L) and the wording of the "Mental health impact"
  question are assumptions. Confirm them against how the dataset was built.
