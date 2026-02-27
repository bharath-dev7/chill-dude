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

API health check:

- `GET http://localhost:8080/api/health`

Auth routes:

- `POST http://localhost:8080/auth/register`
- `POST http://localhost:8080/auth/login`
- `GET http://localhost:8080/auth/me` (requires `Authorization: Bearer <token>`)
