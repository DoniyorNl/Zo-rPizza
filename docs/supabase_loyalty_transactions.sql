-- Faqat shu fayldagi matnni Supabase SQL Editor ga nusxalang. ``` yoki boshqa belgilar QO'SHILMASIN.

-- LoyaltyTransactionType enum (agar mavjud bo'lsa xato bermaydi)
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

-- FKey (birinchi marta: ishlaydi; "already exists" chiqsa e'tiborsiz qoldiring)
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
