# Backend testlar – qanday ishlatish

## Terminal xatosi (aniqlandi)

Backend logida quyidagi xato chiqdi:

```
The column `orders.discountAmount` does not exist in the current database.
```

**Sabab:** Prisma schema da `Order` modelida `discountAmount`, `couponId`, `loyaltyPointsUsed` bor, lekin joriy bazada bu ustunlar yo‘q – migratsiya bajarilmagan.

**Yechim:** Bazaga migratsiyalarni qo‘llang (bazaga ulanish ishlasa):

```bash
cd backend
pnpm prisma migrate deploy
```

Yoki lokal PostgreSQL ishlatilsa, `DATABASE_URL` to‘g‘ri bo‘lishi kerak. Supabase uchun TLS xatosi bo‘lsa, `.env` da `?sslmode=require` yoki Supabase ning bergan connection string ini tekshiring.

---

## Backend testlarni ishga tushirish

### 1. Barcha testlar

```bash
cd backend
pnpm test
```

Yoki loyiha ildizidan:

```bash
pnpm run test:backend
```

### 2. Faqat unit testlar

```bash
cd backend
pnpm run test:unit
```

Controller’lar, middleware, utils va boshqa modullar mock (Prisma, Firebase) bilan test qilinadi. **Haqiqiy DB kerak emas.**

### 3. Faqat integration testlar

```bash
cd backend
pnpm run test:integration
```

Bu testlar haqiqiy API route’larni (Express app) tekshiradi. Kerak bo‘lsa test DB yoki mock ishlatiladi (loyihadagi sozlamaga qarab).

### 4. Watch rejimida (o‘zgarishda qayta ishga tushirish)

```bash
cd backend
pnpm run test:watch
```

### 5. Ma’lum bir fayl yoki suite

```bash
cd backend
pnpm test -- orders.controller.test
pnpm test -- dashboard.controller.test
pnpm test -- tests/unit/controllers/orders.controller.test.ts
```

### 6. Coverage (qoplov)

```bash
cd backend
pnpm test
```

`pnpm test` default tarzda `--coverage` bilan ishlaydi. Natija `coverage/` papkada chiqadi.

---

## Xatoni tez topish uchun

1. **Terminal log:** Backend `pnpm run dev:both` yoki `pnpm run dev:backend` da ishlaganda, xato chiqsa **backend** terminalida to‘liq stack trace chiqadi (masalan `[getUserOrders]` va keyin Prisma xabari). Avval shu logni o‘qing.

2. **Ma’lum controller uchun unit test:**  
   Masalan, `getUserOrders` xato bersa:
   ```bash
   cd backend && pnpm test -- orders.controller.test.ts -t "getUserOrders"
   ```
   Testlar mock DB bilan ishlaydi; agar kodda mantiq xatosi bo‘lsa, test ishlamay qoladi yoki xabar beradi.

3. **Migratsiya / schema farqi:**  
   Xato “column does not exist” bo‘lsa, schema va baza sinxron emas.  
   - Migratsiyalarni qo‘llang: `pnpm prisma migrate deploy`  
   - Yoki `pnpm prisma db push` (development uchun, migratsiya faylsiz schema’ni bazaga yozadi).

---

## Qisqa buyruqlar

| Maqsad              | Buyruq |
|---------------------|--------|
| Barcha backend test | `pnpm run test:backend` (root) yoki `cd backend && pnpm test` |
| Faqat unit          | `cd backend && pnpm run test:unit` |
| Faqat integration   | `cd backend && pnpm run test:integration` |
| Watch               | `cd backend && pnpm run test:watch` |
| Orders testlari     | `cd backend && pnpm test -- orders.controller.test` |
| Migratsiya qo‘llash | `cd backend && pnpm prisma migrate deploy` |

---

## discountAmount xatosi – qilish kerak

1. Bazaga ulanishni tekshiring (Supabase / lokal PostgreSQL).
2. Migratsiyalarni qo‘llang:
   ```bash
   cd backend
   pnpm prisma migrate deploy
   ```
3. Agar `migrate deploy` TLS yoki boshqa sabab bilan ishlamasa, Supabase Dashboard → SQL Editor orqali quyidagini bajarishingiz mumkin (faqat agar `orders` jadvalida bu ustunlar yo‘q bo‘lsa):

   ```sql
   ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discountAmount" DOUBLE PRECISION DEFAULT 0;
   ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "couponId" TEXT;
   ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "loyaltyPointsUsed" INTEGER DEFAULT 0;
   ```

Shundan keyin `getUserOrders` va `createOrder` xatosiz ishlashi kerak.
