# Chill Dude

Chill Dude is a full-stack wellness and productivity app that converts a short daily check-in into one clear next step: `Focus` or `Relax`.

The app combines a client-side face scan, a daily journal entry, task and timetable context, and lightweight recommendation logic to help users structure difficult days without adding extra decision fatigue.

## What It Does

- Auth flow with register, login, and token-based session handling
- Daily face scan using MediaPipe running in the browser
- One journal entry per day, locked after submission
- Automatic recommendation engine that chooses `focus` or `relax`
- Focus room with timer, ambient sounds, and top pending tasks
- Relax room with guided breathing, calm media links, and companion chat
- Read-only diary timeline of past entries
- Task management and daily timetable load tracking
- Weekly insights for stress trend and focus minutes
- Local fallback mode when backend or database access is unavailable

## Stack

### Frontend

- React 19
- Vite
- Tailwind CSS
- React Router
- Recharts
- MediaPipe Tasks Vision

### Backend

- Node.js
- Express 5
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT auth
- bcrypt
- Zod validation

### Deployment

- Vercel for the frontend
- Render for the backend
- Neon PostgreSQL for the database

## Repository Layout

```text
.
|-- backend/    # Express + TypeScript + Prisma API
|-- frontend/   # React + Vite single-page app
|-- docs/       # Product and setup notes
|-- design/     # Mockups and concept assets
`-- README.md
```

## Product Flow

1. User signs in or enters local demo mode.
2. User completes a short face scan for the day.
3. User submits one journal entry.
4. The app recommends either `Focus` or `Relax`.
5. The user completes a guided session.
6. Progress contributes to weekly insights and trend summaries.

## Screens and Modules

- `Login`: email/password auth plus local demo mode
- `Scan`: client-side face expression capture
- `Journal`: single daily journal submission
- `Recommendation`: auto-selected next step for the day
- `Focus Room`: timer, ambient audio, task shortlist
- `Relax Room`: breathing flow, supportive bot, calm media
- `Diary`: read-only daily history
- `Tasks`: task list and timetable load
- `Insights`: 7-day charts and summary metrics
- `Profile`: account and integration surface

## Recommendation Logic

The current recommendation engine blends:

- face signal inferred in the browser
- journal keyword-based stress estimation

The output includes:

- a `focus` or `relax` mode
- a stress score
- human-readable reasons explaining the recommendation

## Data Model

Server-backed records include:

- users
- daily scans
- daily journal entries
- tasks
- timetable load by day
- focus sessions
- relax sessions

The frontend also supports local-only fallback storage for:

- auth demo mode
- journal drafts
- temporary scans
- local tasks and sessions when the backend is unreachable

## Local Development

### Prerequisites

- Node.js and npm
- PostgreSQL database, or a Neon Postgres connection string

### 1. Start the backend

From `backend/`:

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run dev
```

Backend defaults to:

```text
http://localhost:5000
```

Health check:

```text
GET http://localhost:5000/api/health
```

### 2. Start the frontend

From `frontend/`:

```bash
npm install
cp .env.example .env
npm run dev
```

Frontend defaults to:

```text
http://localhost:5173
```

Set `frontend/.env` like this for local development:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_FACE_WASM_PATH=/mediapipe/wasm
VITE_FACE_MODEL_PATH=/mediapipe/models/face_landmarker.task
```

## Environment Variables

### Backend

Create `backend/.env`:

```env
NODE_ENV=development
PORT=5000
CORS_ORIGINS=http://localhost:5173,https://chill-dude.vercel.app,https://*.vercel.app
DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public
DIRECT_URL=postgresql://user:password@host:5432/dbname?schema=public
JWT_SECRET=replace_with_a_long_random_secret_at_least_32_chars
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:5000/api/google/callback
```

### Frontend

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_FACE_WASM_PATH=/mediapipe/wasm
VITE_FACE_MODEL_PATH=/mediapipe/models/face_landmarker.task
```

## Scripts

### Backend

From `backend/`:

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm run smoke:app
npm run prisma:generate
npm run prisma:migrate
npm run prisma:deploy
```

### Frontend

From `frontend/`:

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## API Overview

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Core App State

All routes below require `Authorization: Bearer <token>`:

- `GET /api/app/state`
- `GET /api/app/insights/weekly`
- `POST /api/app/scan`
- `POST /api/app/journal`
- `POST /api/app/tasks`
- `PATCH /api/app/tasks/:taskId/toggle`
- `PUT /api/app/timetable/today`
- `POST /api/app/sessions/focus`
- `POST /api/app/sessions/relax`

### Utility and Integrations

- `GET /api/health`
- `GET /api/google/connect`
- `GET /api/google/callback`
- `GET /api/google/steps`

## Deployment

### Backend

- Deploy the backend to Render
- Configure database access with Neon Postgres
- Set backend environment variables
- Run Prisma migrations on deploy:

```bash
npm run prisma:deploy
```

### Frontend

- Deploy the frontend to Vercel
- Set `VITE_API_BASE_URL` to the deployed backend URL
- Ensure the backend `CORS_ORIGINS` includes the Vercel domain

The frontend already includes SPA rewrites through `frontend/vercel.json`.

## Project Notes

- Journal entries are intentionally immutable after submission.
- Face scanning is processed on-device in the browser.
- Google Fit routes are optional and only work when Google OAuth credentials are configured.
- If the backend is unavailable, the frontend can continue in local mode and cache non-critical data in browser storage.

## Additional Docs

- `docs/STEP1_PRODUCT_SPEC.md`
- `docs/STEP3_SETUP.md`
- `backend/README.md`
- `frontend/README.md`
