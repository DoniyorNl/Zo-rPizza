-- Supabase (yoki boshqa PostgreSQL) da "branches" jadvali yo'q bo'lsa 500 xato chiqadi.
-- Bu faylni Supabase → SQL Editor da bajarib, jadvalni yarating.

CREATE TABLE IF NOT EXISTS "branches" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "lat" DOUBLE PRECISION NOT NULL,
  "lng" DOUBLE PRECISION NOT NULL,
  "phone" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- Prisma migratsiyalari "updatedAt" ga DEFAULT bermaydi; bu yerda DEFAULT qo'shdik, konflikt bo'lmasin.
