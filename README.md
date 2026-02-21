# Zo'r Pizza

Pizza buyurtma va yetkazib berish platformasi (Next.js + Express + Prisma).

## Ishga tushirish

```bash
pnpm install
pnpm dev:both    # frontend (3000) + backend (5001)
```

Yoki alohida: `pnpm dev` (frontend), `pnpm dev:backend` (backend).

## Asosiy sahifalar

| URL | Tavsif |
|-----|--------|
| `/` | Bosh sahifa, menyu |
| `/cart` | Savat |
| `/checkout` | Buyurtma formasi |
| `/orders` | Mening buyurtmalarim |
| `/tracking/[id]` | Buyurtmani kuzatish |
| `/admin` | Admin panel |

## Test va build

```bash
pnpm test           # backend + frontend unit/integration
pnpm test:e2e       # Playwright E2E (dev:both ishlashi kerak)
pnpm build          # frontend + backend build
```

Batafsil buyruqlar: [BUYRUQLAR.md](./BUYRUQLAR.md). Reja: [docs/TESTING_VA_IMPROVEMENT_REJA.md](./docs/TESTING_VA_IMPROVEMENT_REJA.md).
