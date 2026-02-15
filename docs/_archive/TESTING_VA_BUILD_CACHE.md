# Testing va build da caching qanday ishlaydi

Qisqa havola: test va build tezroq ishlashi uchun qayerda cache ishlatiladi va qanday.

---

## 1. Mahalliy (loyihada o‘zingiz ishlaganda)

### Testing (Jest)

| Nima | Qayerda | Qanday ishlaydi |
|------|----------|------------------|
| **Jest cache** | `frontend/.jest-cache`, `backend/.jest-cache` | Birinchi marta test ishlaganda Jest TypeScript va b. fayllarni transform qiladi va natijani cache’ga yozadi. Keyingi safar o‘zgarmagan fayllar uchun transform qayta ishlamaydi – cache’dan olinadi, testlar tezroq tugaydi. |
| **Faqat o‘zgargan test** | `pnpm test:changed` | Git’da `main` dan o‘zgargan fayllar bo‘yicha **faqat shu fayllarga bog‘liq** testlar ishlaydi. Boshqa testlar ishlamaydi – vaqt tejash. |

**Buyruqlar:**

- Barcha testlar (cache avtomatik ishlatiladi): `pnpm test` yoki `pnpm test:frontend` / `pnpm test:backend`
- Faqat o‘zgarganlar bo‘yicha: `pnpm test:changed`

Cache papkalar `.gitignore` da – Git’ga commit qilinmaydi.

### Build (Next.js)

| Nima | Qayerda | Qanday ishlaydi |
|------|----------|------------------|
| **Next.js cache** | `frontend/.next/cache` | `pnpm build` (yoki `next build`) birinchi marta kompilatsiya qiladi va natijani `.next/cache` ga yozadi. Keyingi build’larda o‘zgarmagan qismlar cache’dan olinadi – build tezroq. |

**Buyruq:** `pnpm build` (root’dan). Cache avtomatik ishlatiladi.

Backend’da haqiqiy build yo‘q (skript faqat `echo`), shuning uchun build cache faqat frontend (Next.js) uchun.

---

## 2. CI (GitHub Actions) da

CI har push/PR da ishlaganda cache orqali install, test va build tezroq bo‘ladi.

| Cache | Path | Key (qachon yangilanadi) |
|-------|------|---------------------------|
| **pnpm** | pnpm store | `cache: 'pnpm'` (setup-node) – lockfile o‘zgaganda |
| **Next.js** | `frontend/.next/cache` | `next-<os>-<hash(frontend/pnpm-lock.yaml, package.json)>` |
| **Jest (frontend)** | `frontend/.jest-cache` | `jest-frontend-<os>-<hash(frontend/**/*.ts, *.tsx)>` |
| **Jest (backend)** | `backend/.jest-cache` | `jest-backend-<os>-<hash(backend/src, tests)>` |

**Tartib:**

1. **Restore:** CI boshlanganda cache’lar (agar key mos bo‘lsa) restore qilinadi.
2. **Install:** `pnpm install --frozen-lockfile` – pnpm cache’i bor bo‘lsa tezroq.
3. **Test:** Backend va frontend test – Jest cache’i bor bo‘lsa transform tezroq.
4. **Build:** `pnpm build` – Next.js cache’i bor bo‘lsa build tezroq.
5. **Save:** Step’lar tugagach, o‘zgargan cache’lar (masalan yangi .jest-cache, .next/cache) saqlanadi – keyingi run uchun.

Batafsil: **docs/VERSIYA_VA_CACHE.md** (2- va 3-bo‘limlar), **.github/workflows/ci.yml** (Cache Next.js, Cache Jest qadamları).

---

## 3. Qisqa jadval

| Vazifa | Mahalliy | CI |
|--------|----------|-----|
| Test tezroq | Jest `.jest-cache` (avtomatik) | Jest cache restore/save |
| Faqat o‘zgargan test | `pnpm test:changed` | – |
| Build tezroq | Next.js `.next/cache` (avtomatik) | Next.js cache restore/save |
| Install tezroq | – | pnpm cache (setup-node) |
