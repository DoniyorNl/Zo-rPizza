# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Zor Pizza is a full-stack pizza delivery platform (monorepo with pnpm workspaces):
- **Frontend**: Next.js 15 App Router on port 3000 (`pnpm dev`)
- **Backend**: Express.js + Prisma + Socket.IO on port 5001 (`pnpm dev:backend`)
- **Database**: PostgreSQL (local), schema managed by Prisma ORM

Standard commands for lint, test, build, and dev are documented in `README.md` and in root `package.json` scripts.

### Non-obvious caveats

- **Firebase service account required for backend startup**: The backend imports `firebase.ts` at module load time (via route imports), so the server crashes if no Firebase credential is available. For local dev without real Firebase, place a `firebase-service-account.json` in `backend/` with a valid RSA private key (the key doesn't need to correspond to a real project). The server will log a Firebase warning but continue running without auth.
- **Prisma migrations have ordering issues**: Use `npx prisma db push` instead of `prisma migrate deploy` for fresh local development databases. The migration `20260214_add_branches_promo_loyalty` references the `coupons` table before it is created by earlier migrations.
- **PostgreSQL required**: Install PostgreSQL locally. Create a database and user, then configure `DATABASE_URL` and `DIRECT_URL` in `backend/.env`. Example: `postgresql://zorpizza:zorpizza@localhost:5432/zorpizza`.
- **Backend tests use mocks**: All 501 backend tests use mocked Prisma (`jest-mock-extended`) and mocked Firebase — no real database or Firebase project needed for `pnpm test:backend`.
- **Frontend lint has pre-existing errors**: `pnpm --filter frontend lint` reports ~85 errors and ~57 warnings (unescaped entities, unused vars, etc.) that are pre-existing in the codebase.
- **Frontend dev server binds to 127.0.0.1**: The Next.js dev server is configured with `-H 127.0.0.1`, so use `http://127.0.0.1:3000` (not `localhost`) when testing.
- **`.env` files**: Backend uses `backend/.env` (copy from `backend/.env.example`). Frontend uses `frontend/.env.local`. At minimum set `NEXT_PUBLIC_API_URL=http://localhost:5001` in the frontend env.
