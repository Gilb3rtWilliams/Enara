# Enara — website

The Enara website: a landing page, About and Privacy pages, and the signed-in app (symptom check, results,
dashboard, history and cycle calendar). Built with React, TypeScript, Vite and React Router, in the same
colours, fonts and logo as the mobile app. It talks to the same FastAPI backend (`POST /predict`).

## Run it

Use two terminals.

```bash
# terminal 1: backend (from the project root, venv active)
python -m uvicorn app.main:app --port 8000

# terminal 2: website (this folder)
npm install
npm run dev          # http://localhost:5173
```

The site calls the backend on the same host that serves it, port 8000. To use another address, copy
`.env.example` to `.env` and set `VITE_API_URL`. The backend allows `localhost:5173` by default.

## Pages

| Address | What it is | Signed in? |
|---|---|---|
| `/` | Landing page: how it works, what Enara looks at, FAQ | no |
| `/about`, `/privacy` | The model, its limits, and what is stored | no |
| `/signup`, `/signin` | Local account (split-screen layout) | no |
| `/check` | The three-part symptom check (`?part=1` to `3`) | yes |
| `/result`, `/tier2`, `/result/combined` | Tier 1 result, add CA-125 and CRP, combined result | yes |
| `/dashboard`, `/history`, `/calendar` | The signed-in app | yes |

## Deploying

```bash
npm run build        # output in dist/
```

Upload `dist/` to any static host **over HTTPS**. Because the site uses real addresses like `/dashboard`, the host
must send every path to `index.html`. This is already set up for **Netlify** (`public/_redirects`) and **Vercel**
(`vercel.json`). On other hosts, add an equivalent "single-page app" rewrite.

Then, on the backend, set `ENDO_CORS_ORIGINS` to the site's address (for example `https://enara.example.com`) and
set `VITE_API_URL` to the HTTPS address of the API before building.

## Notes

- **Data stays in the browser** (localStorage). The account is a local lock, not a server account, so clearing site
  data deletes everything. The account menu has *Sign out* and *Delete my data*.
- **Fonts are bundled** (DM Sans and Fraunces via Fontsource), so the site makes no requests to Google Fonts.
- On phones the site collapses to a menu button and the signed-in app gets a bottom tab bar.
- The website and the mobile app keep separate data; nothing syncs between them.
