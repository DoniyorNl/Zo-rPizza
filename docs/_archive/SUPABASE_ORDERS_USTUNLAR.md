# orders jadvalidagi ustunlar (discountAmount va boshqalar)

## Muammo

`The column orders.discountAmount does not exist in the current database` – Prisma schema da ustun bor, lekin joriy bazada yo‘q.

## Agar avval Supabase’da ishlagan bo‘lsa

Ehtimol hozir **boshqa Supabase loyihasi** yoki **boshqa DB** ga ulanayapsiz:

1. **Qaysi bazaga ulanayotganingizni tekshiring**
   - Backend terminalida server ishga tushganda Prisma **host** ni ko‘rsatadi, masalan:  
     `database "postgres" at "db.XXXX.supabase.co:5432"`
   - Supabase Dashboard → **Project Settings** → **Database** → **Connection string** (URI).
   - `.env` dagi `DATABASE_URL` (va kerak bo‘lsa `DIRECT_URL`) ana shu loyiha uchun bo‘lishi kerak. Boshqa loyiha (masalan, yangi yoki test) bo‘lsa, unda migratsiya bajarilmagan bo‘ladi – ustunlar yo‘q.

2. **To‘g‘ri loyihada ustunlar bormi?**
   - Supabase → **Table Editor** → **orders** → ustunlar ro‘yxatida `discountAmount`, `couponId`, `loyaltyPointsUsed` bormi tekshiring.
   - Agar **bor** bo‘lsa – ilova hozir boshqa bazaga ulanayotgan; `.env` da shu loyihaning `DATABASE_URL` ishlatilishini ta’minlang.
   - Agar **yo‘q** bo‘lsa – ustunlar shu loyihada ham qo‘shilishi kerak (pastdagi SQL).

3. **Xavfsiz qayta qo‘shish (bir xil loyihada)**

Agar o‘sha Supabase loyihasida ustunlar yo‘q bo‘lsa yoki ishonchingiz komil bo‘lmasa, quyidagi SQL **xavfsiz** – `IF NOT EXISTS` tufayli ustun allaqachon bo‘lsa, hech narsa o‘zgarmaydi. Bir marta ishlatish kifoya:

```sql
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discountAmount" DOUBLE PRECISION DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "couponId" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "loyaltyPointsUsed" INTEGER DEFAULT 0;
```

**Qayerda bajarish:** Supabase Dashboard → **SQL Editor** → yangi query → yuqoridagini yozing → Run.

## Qisqacha

| Vaziyat | Nima qilish |
|--------|----------------|
| Avval ishlagan, hozir xato | `.env` dagi `DATABASE_URL` ni tekshiring – hozir qaysi Supabase loyihasiga ulanayapti? To‘g‘ri loyihada ustunlar bor bo‘lishi mumkin. |
| To‘g‘ri loyiha, lekin ustunlar yo‘q | Yuqoridagi 3 qatorni SQL Editor’da ishlating (IF NOT EXISTS – xavfsiz). |
| Yangi / boshqa loyiha | Shu yangi bazada ham yuqoridagi SQL ni bajarish kerak (yoki `prisma migrate deploy`). |

---

## loyalty_transactions jadvali yo‘q (checkout 500)

**Xato:** `The table public.loyalty_transactions does not exist in the current database` – buyurtma berish (POST /api/orders) paytida 500.

**Vaqtinchalik yechim:** Backend endi bu jadval yo‘q bo‘lsa ham buyurtmani saqlaydi va 201 qaytaradi (loyalty ballar yozilmaydi). Checkout ishlashi kerak.

**To‘liq ishlashi uchun** (loyalty ballar saqlanishi uchun) Supabase’da jadval yaratish:

**Qayerda:** Supabase Dashboard → **SQL Editor** → yangi query → **faqat quyidagi SQL**ni nusxalang (`` ``` `` yoki `` ```sql `` belgilarini NUSXALAMANG – ular Markdown belgisi, SQL emas).

Yoki loyiha ichidagi fayldan toza SQL nusxalang: **`docs/supabase_loyalty_transactions.sql`**

<details>
<summary>SQL (bu blokni ochib nusxalang)</summary>

```sql
-- LoyaltyTransactionType enum (agar mavjud bo‘lsa xato bermaydi)
DO $$ BEGIN
  CREATE TYPE "LoyaltyTransactionType" AS ENUM ('EARN', 'REDEEM');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- loyalty_transactions jadvali
CREATE TABLE IF NOT EXISTS "loyalty_transactions" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "LoyaltyTransactionType" NOT NULL,
  "points" INTEGER NOT NULL,
  "orderId" TEXT,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "loyalty_transactions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "loyalty_transactions_userId_idx" ON "loyalty_transactions"("userId");

-- FKey (birinchi marta: ishlaydi; keyin qayta ishlatsangiz "already exists" xabari chiqishi mumkin – e'tiborsiz qoldiring)
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

</details>
