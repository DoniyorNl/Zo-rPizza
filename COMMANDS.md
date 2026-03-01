# Buyruqlar (pnpm / npm)

Loyiha **monorepo**: root da **pnpm**, frontend papkada **npm** ham ishlatish mumkin (masalan, Vercel build uchun).

---

## Qisqacha farq

| Joy | Package manager | Sabab |
|-----|-----------------|--------|
| **Root** (loyiha ildizi) | **pnpm** | Monorepo boshqaruvi, `pnpm-workspace.yaml`, barcha paketlar bitta lockfile |
| **frontend/** ichida | **npm** yoki **pnpm** | Root dan `pnpm --filter frontend` yoki `cd frontend && npm ...` (Vercel npm ishlatadi) |
| **backend/** | Root orqali **pnpm** | Mustaqil `cd backend && npm/pnpm` odatda kerak emas |

---

## Root dan (pnpm)

Barcha ishlar loyiha ildizida **pnpm** bilan.

### O‘rnatish
```bash
pnpm install
```
Barcha workspace (frontend, backend) dependencylari o‘rnatiladi.

### Ishlatish (development)
```bash
pnpm run dev              # frontend (Next.js) — http://127.0.0.1:3000
pnpm run dev:backend      # backend (Express)
pnpm run dev:both         # frontend + backend birga
```

### Build
```bash
pnpm run build            # frontend va backend build (backend hozir skip)
pnpm --filter frontend run build    # faqat frontend build
```

### Test
```bash
pnpm run test                  # barcha testlar (frontend + backend)
pnpm run test:frontend         # faqat frontend test
pnpm run test:backend          # faqat backend test
pnpm run test:frontend:watch   # frontend test (watch)
pnpm run test:backend:watch    # backend test (watch)
pnpm run test:frontend:coverage
pnpm run test:backend:coverage
pnpm run test:e2e             # frontend E2E (Playwright)
pnpm run test:e2e:ui          # E2E UI rejimida
pnpm run test:changed         # o‘zgargan fayllar bo‘yicha test
pnpm run test:all             # barcha unit + E2E
```

### Lint
```bash
pnpm run lint                 # frontend ESLint
```

---

## Frontend papkada (npm)

Vercel **frontend** ni Root Directory qilib, **npm** bilan install/build qiladi. Lokalda ham xuddi shu muhitni takrorlash uchun:

### O‘rnatish
```bash
cd frontend
npm install
```
`.npmrc` da `legacy-peer-deps=true` va `ignore-scripts=true` bor (peer conflict va husky script xatolarini oldini olish uchun).

### Build
```bash
cd frontend
npm run build
```

### Ishlatish (production build)
```bash
cd frontend
npm run build
npm start
```

### Test (frontend)
```bash
cd frontend
npm test
npm run test:watch
npm run test:coverage
```

---

## Frontend papkada (pnpm, root orqali)

Root da pnpm install qilingan bo‘lsa, frontend alohida install qilmasdan ishlatiladi:

```bash
# Root da
pnpm install
pnpm run dev           # frontend
pnpm --filter frontend run build
pnpm --filter frontend test
```

---

## Backend

Backend odatda root orqali ishlatiladi; scriptlar ichida `npx` (jest, prisma) ishlatiladi:

```bash
# Root dan
pnpm run dev:backend
pnpm run test:backend
pnpm run test:backend:watch
pnpm run test:backend:coverage
```

Backend papkada to‘g‘ridan-to‘g‘ri:
```bash
cd backend
pnpm install   # yoki root da pnpm install qilingan bo‘lsa kerak emas
pnpm run dev
npx jest --coverage
```

---

## O‘zgarishlar xulosasi

1. **Root** — hamma narsa **pnpm**: `pnpm install`, `pnpm run dev`, `pnpm run build`, `pnpm run test`, `pnpm run lint`.
2. **Frontend** — Vercel va ba’zi lokal stsenariylar uchun **npm** qo‘llanildi: `cd frontend && npm install && npm run build` (`.npmrc` tufayli peer/script xatolari bartaraf).
3. **Backend** — root dan **pnpm** (filter orqali); backend scriptlari o‘zida `npx` (jest, prisma).
4. **engines.pnpm** root `package.json` dan olib tashlangan — Vercel da pnpm 6 bilan conflict bo‘lmasligi uchun.
5. **Frontend .npmrc** — faqat `frontend/` da npm ishlatilganda: `legacy-peer-deps=true`, `ignore-scripts=true`.

---

## Tezkor ma’lumot

| Maqsad | Buyruq |
|--------|--------|
| Loyihani ishga tushirish | `pnpm install` keyin `pnpm run dev` |
| Faqat frontend | `pnpm run dev` (root da) |
| Frontend build (Vercel kabi) | `cd frontend && npm install && npm run build` |
| Barcha testlar | `pnpm run test` |
| Lint | `pnpm run lint` |
