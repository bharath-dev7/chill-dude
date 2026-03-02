# Step 3 Setup Notes (Neon + Render + Vercel)

## 1. Backend env required
Set these in backend `.env` (local) and Render service env:

- `DATABASE_URL` -> Neon Postgres connection string
- `JWT_SECRET` -> minimum 32 chars
- `JWT_EXPIRES_IN` -> e.g. `7d`
- `CORS_ORIGINS` -> include local + deployed frontend domains
- Google vars are optional unless you use Google routes

## 2. Apply new Prisma migration
From `backend/`:

```bash
npm run prisma:generate
npm run prisma:deploy
```

For local dev only:

```bash
npm run prisma:migrate -- --name app_state
```

## 3. New API surface (auth required)
All routes below are under `/api/app` and require `Authorization: Bearer <token>`:

- `GET /state`
- `GET /insights/weekly`
- `POST /scan`
- `POST /journal`
- `POST /tasks`
- `PATCH /tasks/:taskId/toggle`
- `PUT /timetable/today`
- `POST /sessions/focus`
- `POST /sessions/relax`

## 4. Frontend integration status
- App state now syncs through backend APIs
- Journal draft remains in local storage only (temporary)
- Submitted journals/progress/tasks/sessions are server-backed

## 5. Deployment order
1. Deploy backend (Render) with Neon env vars
2. Run migration (`prisma migrate deploy`) on backend
3. Deploy frontend (Vercel) with `VITE_API_BASE_URL` set to Render API URL

## 6. Quick verification
With backend running and DB migrated:

```bash
cd backend
npm run smoke:app
```
