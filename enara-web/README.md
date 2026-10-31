# Enara — web app

The browser version of the Enara mobile app: same name, logo, colours, fonts and screens, built with
React, TypeScript and Vite. It talks to the same FastAPI backend (`POST /predict`) for every score.

## Run it

```bash
# 1. backend (from the project root, venv active)
python -m uvicorn app.main:app --port 8000

# 2. web app (this folder)
npm install
npm run dev          # http://localhost:5173
```

The app calls the backend on the same host that serves it, port 8000. To use another address, copy
`.env.example` to `.env` and set `VITE_API_URL`. The backend allows `localhost:5173` by default; for a deployed
site, set `ENDO_CORS_ORIGINS` on the backend to the site's URL.

Build for production: `npm run build` (output in `dist/`, deploy to any static host over **https**).

## Notes

- **Same design as the app.** The stylesheet comes from the Figma Make export. On phones the app fills the screen; on
  desktop it sits in the same rounded phone frame as the design.
- **Same features as the app.** Assessment, Tier 1 and Tier 2 results, dashboard, history, cycle calendar, doctor summary
  (uses the browser's share sheet, or copies the text).
- **Data stays in this browser** (localStorage). Accounts are a local lock only, not server accounts, so clearing site
  data deletes everything. The avatar menu has *Sign out* and *Delete my data*.
- **Fonts are bundled** (DM Sans and Fraunces via Fontsource), so the app makes no requests to Google Fonts.
- The browser and the mobile app keep separate data; nothing syncs between them.
