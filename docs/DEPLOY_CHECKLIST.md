# Deploy Checklist

## Pre-deploy (har safar)

- [ ] `pnpm install` (root)
- [ ] `pnpm build` – xatosiz
- [ ] `pnpm test` – barcha unit/integration o'tadi
- [ ] (Ixtiyoriy) `pnpm test:e2e` – backend + frontend ishlab turgan holda

## Production env (hech narsani commit qilmaslik)

### Backend (Railway / Render / server)

| O'zgaruvchi | Majburiy | Izoh |
|-------------|----------|------|
| `DATABASE_URL` | Ha | PostgreSQL connection string |
| `FRONTEND_URLS` | Ha | Frontend origin(lar), vergul bilan |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | Ha | Service account JSON, Base64 |
| `PORT` | Yo'q | Default 5001 |
| `NODE_ENV` | Yo'q | production |

### Frontend (Vercel / Netlify)

| O'zgaruvchi | Majburiy | Izoh |
|-------------|----------|------|
| `NEXT_PUBLIC_API_URL` | Ha | Backend URL (https://...) |
| `NEXT_PUBLIC_FIREBASE_*` | Ha | Firebase client (API_KEY, AUTH_DOMAIN, PROJECT_ID, ...) |

Namuna: `backend/.env.example`, `frontend/.env.example`.

## Keyingi qadamlar

```bash
pnpm install
pnpm build
pnpm run dev:both   # local tekshirish
```

Batafsil: `docs/deployment/DEPLOYMENT_GUIDE.md`, `docs/deployment/ENVIRONMENT_SETUP.md`.

---

## Arxiv (cleanup)

- Unused packages/filelar olib tashlangan; docs `_archive/` da.
