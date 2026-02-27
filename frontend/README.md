# Frontend Deployment Guide

This frontend is a Vite + React SPA prepared for:

- Frontend hosting on Vercel
- Backend API hosting on Render
- Database behind backend (for example Supabase Postgres)

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
```
4. Start dev server:
```bash
npm run dev
```

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

## Backend requirement (Render)

Your Render API must allow CORS from:

- `https://<your-vercel-domain>.vercel.app`
- Your custom frontend domain (if any)

Frontend login now calls:

- `POST /auth/login` with JSON body `{ email, password }`
- Expected success response includes `token`
