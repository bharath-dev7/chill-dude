# Backend Setup

## Run locally

1. Copy env file:
```bash
cp .env.example .env
```
2. Install dependencies:
```bash
npm install
```
3. Generate Prisma client:
```bash
npm run prisma:generate
```
4. Run migrations (requires a working PostgreSQL URL in `.env`):
```bash
npm run prisma:migrate -- --name init
```
5. Start dev server:
```bash
npm run dev
```

## Step 3 migration (new app state models)

After updating to the latest schema:

```bash
npm run prisma:generate
npm run prisma:deploy
```

## Quick smoke check

With backend running locally:

```bash
npm run smoke:app
```

Optional environment variables:

- `SMOKE_BASE_URL` (default: `http://localhost:5000`)
- `SMOKE_TEST_PASSWORD` (default: `smoke-test-password-123`)

API health check:

- `GET http://localhost:5000/api/health`

Auth routes:

- `POST http://localhost:5000/auth/register`
- `POST http://localhost:5000/auth/login`
- `GET http://localhost:5000/auth/me` (requires `Authorization: Bearer <token>`)

Google Fit OAuth routes:

- `GET http://localhost:5000/api/google/connect`
- `GET http://localhost:5000/api/google/callback`
- `GET http://localhost:5000/api/google/steps`

App state routes (auth required):

- `GET http://localhost:5000/api/app/state`
- `GET http://localhost:5000/api/app/insights/weekly`
- `POST http://localhost:5000/api/app/scan`
- `POST http://localhost:5000/api/app/journal`
- `POST http://localhost:5000/api/app/tasks`
- `PATCH http://localhost:5000/api/app/tasks/:taskId/toggle`
- `PUT http://localhost:5000/api/app/timetable/today`
- `POST http://localhost:5000/api/app/sessions/focus`
- `POST http://localhost:5000/api/app/sessions/relax`
