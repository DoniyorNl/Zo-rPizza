# Loyiha buyruqlari (qisqa havola)

Barcha buyruqlar **loyiha root** papkasidan (`Zo-rPizza/`). Root’da `pnpm run <script>` yoki quyidagi jadvaldagi buyruqlar.

---

## Root’dan: install va package qo‘shish

| Buyruq | Nima qiladi |
|--------|--------------|
| `pnpm install` | Barcha package’larni o‘rnatish (frontend + backend) |
| `pnpm install --frozen-lockfile` | Lockfile’dan o‘rnatish (CI, versiya o‘zgarmasin) |
| `pnpm add <package> --filter frontend` | Frontend’ga dependency qo‘shish |
| `pnpm add -D <package> --filter frontend` | Frontend’ga devDependency qo‘shish |
| `pnpm add <package> --filter zor-pizza-backend` | Backend’ga dependency qo‘shish |
| `pnpm add -D <package> --filter zor-pizza-backend` | Backend’ga devDependency qo‘shish |

---

## Root’dan: ishga tushirish (dev)

| Buyruq | Nima qiladi |
|--------|--------------|
| `pnpm dev` | Faqat frontend dev server (Next.js) |
| `pnpm dev:backend` | Faqat backend dev server (tsx watch) |
| `pnpm dev:both` | Frontend va backend birga parallel |

---

## Root’dan: build va start

| Buyruq | Nima qiladi |
|--------|--------------|
| `pnpm build` | Frontend + backend build (backend no-op) |
| `pnpm --filter frontend start` | Frontend production (next start) |
| `pnpm --filter zor-pizza-backend start` | Backend production (tsx server) |

---

## Root’dan: test

| Buyruq | Nima qiladi |
|--------|--------------|
| `pnpm test` | Backend va frontend testlar |
| `pnpm test:frontend` | Faqat frontend testlar |
| `pnpm test:backend` | Faqat backend testlar |
| `pnpm test:changed` | Faqat o‘zgargan fayllar bo‘yicha test (main’dan) |
| `pnpm test:frontend:watch` | Frontend testlar watch rejimida |
| `pnpm test:backend:watch` | Backend testlar watch rejimida |
| `pnpm test:frontend:coverage` | Frontend coverage |
| `pnpm test:backend:coverage` | Backend coverage |
| `pnpm test:e2e` | Playwright e2e testlar |
| `pnpm test:e2e:ui` | Playwright e2e UI rejimida |
| `pnpm test:all` | Barcha unit/integration + e2e |

---

## Root’dan: backend (Prisma)

| Buyruq | Nima qiladi |
|--------|--------------|
| `pnpm --filter zor-pizza-backend run prisma:generate` | Prisma client generatsiya |
| `pnpm --filter zor-pizza-backend run prisma:push` | Schema’ni DB’ga push (dev) |
| `pnpm --filter zor-pizza-backend run prisma:migrate` | Migration’larni deploy qilish |
| `pnpm --filter zor-pizza-backend run prisma:seed` | Seed ishga tushirish |

---

## Qisqa: eng keraklilari

| Vazifa | Buyruq |
|--------|--------|
| Loyihani ishga tushirish | `pnpm install` → `pnpm dev:backend` (bitta terminal), `pnpm dev` (ikkinchi terminal) |
| Frontend’ga package qo‘shish | `pnpm add <package> --filter frontend` |
| Backend’ga package qo‘shish | `pnpm add <package> --filter zor-pizza-backend` |
| Testlar | `pnpm test` yoki `pnpm test:frontend` / `pnpm test:backend` |
| Build | `pnpm build` |
