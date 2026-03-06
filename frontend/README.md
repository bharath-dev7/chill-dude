# Frontend Deployment Guide

This frontend is a Vite + React SPA prepared for:

- Frontend hosting on Vercel
- Backend API hosting on Render
- Database behind backend (Neon Postgres via backend)

## Local setup

1. Install dependencies:
```bash
npm install
```
2. Create env file:
```bash
cp .env.example .env
```
3. Set API URL in `.env`:
```env
VITE_API_BASE_URL=https://your-render-service.onrender.com
VITE_FACE_WASM_PATH=/mediapipe/wasm
VITE_FACE_MODEL_PATH=/mediapipe/models/face_landmarker.task
```
4. Start dev server:
```bash
npm run dev
```

## Face scan local model

The face-expression scanner runs fully on-device using MediaPipe tasks.

- `VITE_FACE_WASM_PATH` should point to the wasm folder served by Vite.
- `VITE_FACE_MODEL_PATH` should point to a local `.task` model file served by Vite.

Default values already match files in `public/mediapipe/`.

## Build check

```bash
npm run build
```

## Vercel settings

- Framework preset: `Vite`
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable:
  - `VITE_API_BASE_URL=https://<your-render-service>.onrender.com`

`vercel.json` already includes an SPA rewrite so direct routes like `/dashboard` work on refresh.
`vercel.json` already includes an SPA rewrite so direct routes like `/recommendation` work on refresh.

## Backend requirement (Render)

Your Render API must allow CORS from:

- `https://<your-vercel-domain>.vercel.app`
- Your custom frontend domain (if any)

Frontend login now calls:

- `POST /auth/login` with JSON body `{ email, password }`
- Expected success response includes `token`

After login, the daily app flow is:

1. `/scan`
2. `/journal`
3. `/recommendation`
