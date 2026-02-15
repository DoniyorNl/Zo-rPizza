-- Agar "The column orders.discountAmount does not exist" xatosi chiqsa
-- va `pnpm prisma migrate deploy` ishlamasa (TLS va h.k.),
-- Supabase SQL Editor yoki psql orqali bajarishingiz mumkin.
-- Faqat bir marta ishlating.

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discountAmount" DOUBLE PRECISION DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "couponId" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "loyaltyPointsUsed" INTEGER DEFAULT 0;
