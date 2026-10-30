# Enara — mobile app (Expo / React Native)

Built from the Figma Make design (`enara-sample-ui`). Talks to the FastAPI backend (`POST /predict`) for every score.
Targets **Expo SDK 57**, which is what the Expo Go app in the stores runs until SDK 58 rolls out.

## Run it

**1. Backend** (from `~/Desktop/Enara`, with your venv active). It must listen on all interfaces so your phone can reach it:

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

If your phone can't connect, allow port 8000 through the firewall (`sudo ufw allow 8000/tcp` if ufw is on) and make sure the phone and laptop are on the same Wi-Fi.

**2. App** (this folder):

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** (Android) or the Camera app (iOS). The app finds the backend by reusing your laptop's
address from the QR code, on port 8000. To point somewhere else, copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL`.

If Expo Go has already updated to SDK 58 and refuses to open the project:

```bash
npx expo install expo@^58.0.0 --fix
```

Try it without a phone: `npx expo start --web` (then allow that origin on the backend with
`ENDO_CORS_ORIGINS=http://localhost:8081`). Note the symptom sliders only respond to mouse/touch on web.

## How it maps to the design

| Screen | Notes |
|---|---|
| Welcome, Sign in, Create account, Profile | Same layout. Accounts are **on-device only** (see below). |
| Assessment (3 parts) | Answers are saved as a draft, so people can pause. Validation matches the backend's limits. |
| Result / Combined result | Scores come from the model. Two levels (Elevated / Lower) because the model has one cutoff. |
| Dashboard / History | Built from the results saved on the phone (the design had sample data). |
| Tier 2 | Re-scores the saved symptom answers together with CA-125 and CRP. Only offered after an elevated Tier 1 result. |
| Calendar | Tap a day to log a period; cycle day, phase and next period are estimated from what's logged and the cycle length answered. |

## Things to know

- **No server accounts.** Sign-in only protects the app on this phone (salted SHA-256 hash stored locally). "Forgot password"
  can't email anything. Real accounts need backend work: a users table, argon2/bcrypt hashing, tokens.
- **Data stays on the device** (AsyncStorage). The only thing sent to the backend is the answers needed to calculate a result.
  Avatar menu → *Delete my data* wipes everything.
- **Placeholders:** `assets/` still has Expo's default icons. Replace `icon.png`, `android-icon-*.png` and `favicon.png`.
- **Confirm with your friend:** lab units (CA-125 in U/mL, CRP in mg/L) and the direction of the "Mental wellbeing" slider
  (the design says higher = better; make sure that matches how the dataset's `Mental_Health_Score` was recorded).
- **Shipping a real build** needs an https backend (Android blocks plain http in release builds), then `eas build`.
