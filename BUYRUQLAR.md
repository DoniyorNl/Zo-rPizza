# Loyiha Buyruqlari (copy-friendly)

Barcha buyruqlarni loyiha root papkasidan (`Zo-rPizza/`) ishlating.

---

## Install va package qo‘shish

- Barcha package’larni o‘rnatish:
```bash
pnpm install
```

- Lockfile bo‘yicha o‘rnatish (CI):
```bash
pnpm install --frozen-lockfile
```

- Frontend dependency qo‘shish:
```bash
pnpm add <package> --filter frontend
```

- Frontend devDependency qo‘shish:
```bash
pnpm add -D <package> --filter frontend
```

- Backend dependency qo‘shish:
```bash
pnpm add <package> --filter zor-pizza-backend
```

- Backend devDependency qo‘shish:
```bash
pnpm add -D <package> --filter zor-pizza-backend
```

---

## Dev ishga tushirish

- Faqat frontend:
```bash
pnpm dev
```

- Faqat backend:
```bash
pnpm dev:backend
```

- Frontend + backend birga:
```bash
pnpm dev:both
```

---

## Build va start

- Build:
```bash
pnpm build
```

- Frontend production start:
```bash
pnpm --filter frontend start
```

- Backend production start:
```bash
pnpm --filter zor-pizza-backend start
```

---

## Testlar

- Barcha testlar:
```bash
pnpm test
```

- Faqat frontend testlar:
```bash
pnpm test:frontend
```

- Faqat backend testlar:
```bash
pnpm test:backend
```

- O‘zgargan fayllar bo‘yicha test:
```bash
pnpm test:changed
```

- Frontend watch:
```bash
pnpm test:frontend:watch
```

- Backend watch:
```bash
pnpm test:backend:watch
```

- Frontend coverage:
```bash
pnpm test:frontend:coverage
```

- Backend coverage:
```bash
pnpm test:backend:coverage
```

- E2E test:
```bash
pnpm test:e2e
```

- E2E UI:
```bash
pnpm test:e2e:ui
```

- Hammasi (unit/integration + e2e):
```bash
pnpm test:all
```

---

## Backend (Prisma)

- Prisma client generatsiya:
```bash
pnpm --filter zor-pizza-backend run prisma:generate
```

- Schema’ni DB’ga push (dev):
```bash
pnpm --filter zor-pizza-backend run prisma:push
```

- Migration deploy:
```bash
pnpm --filter zor-pizza-backend run prisma:migrate
```

- Seed:
```bash
pnpm --filter zor-pizza-backend run prisma:seed
```

---

## Stripe (local webhook)

- Stripe eventlarini local backend webhook endpointiga forward qilish:
```bash
stripe listen --forward-to localhost:5001/api/payment/webhook
```