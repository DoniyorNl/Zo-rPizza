-- =============================================================
-- Migration: Add all missing tables and enum values
-- =============================================================

-- -------------------------------------------------------
-- 1. New ENUMs (idempotent)
-- -------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE "DiscountType" AS ENUM ('PERCENT', 'FIXED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "DealItemType" AS ENUM ('PIZZA', 'DRINK', 'SIDE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentProvider" AS ENUM ('CLICK', 'PAYME');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "NotificationType" AS ENUM ('INFO', 'WARNING', 'SUCCESS', 'ERROR', 'ORDER', 'ORDER_UPDATE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- -------------------------------------------------------
-- 2. Add missing values to existing ENUMs (idempotent)
-- -------------------------------------------------------

DO $$ BEGIN
  ALTER TYPE "OrderStatus" ADD VALUE 'OUT_FOR_DELIVERY';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "PaymentMethod" ADD VALUE 'CLICK';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "PaymentMethod" ADD VALUE 'PAYME';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- -------------------------------------------------------
-- 3. Missing columns on existing tables
-- -------------------------------------------------------

-- users: profile + loyalty + preferences
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar"                      TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "dateOfBirth"                  TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "gender"                       TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "favoriteProducts"             JSONB;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "dietaryPrefs"                 TEXT[] DEFAULT '{}';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "allergyInfo"                  TEXT[] DEFAULT '{}';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "loyaltyPoints"                INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "totalSpent"                   DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "memberSince"                  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailNotificationsEnabled"    BOOLEAN NOT NULL DEFAULT true;

-- orders: guest fields + delivery coords + branch
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "deliveryLat"     DOUBLE PRECISION;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "deliveryLng"     DOUBLE PRECISION;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "branchId"        TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customerName"    TEXT;
ALTER TABLE "users"  ADD COLUMN IF NOT EXISTS "firebaseUid"     TEXT;

-- orders.userId nullable (guest orders)
ALTER TABLE "orders" ALTER COLUMN "userId" DROP NOT NULL;

-- orders: fix existing FK to allow SET NULL for optional userId
DO $$ BEGIN
  ALTER TABLE "orders" DROP CONSTRAINT "orders_userId_fkey";
EXCEPTION WHEN undefined_object THEN NULL; END $$;

ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- order_items: variationId
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "variationId" TEXT;

-- -------------------------------------------------------
-- 4. Missing tables
-- -------------------------------------------------------

-- toppings
CREATE TABLE IF NOT EXISTS "toppings" (
    "id"        TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "price"     DOUBLE PRECISION NOT NULL,
    "isActive"  BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "toppings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "toppings_name_key" ON "toppings"("name");

-- product_toppings
CREATE TABLE IF NOT EXISTS "product_toppings" (
    "id"        TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "toppingId" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "product_toppings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "product_toppings_productId_toppingId_key"
    ON "product_toppings"("productId", "toppingId");

DO $$ BEGIN
  ALTER TABLE "product_toppings" ADD CONSTRAINT "product_toppings_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "product_toppings" ADD CONSTRAINT "product_toppings_toppingId_fkey"
    FOREIGN KEY ("toppingId") REFERENCES "toppings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- order_item_toppings
CREATE TABLE IF NOT EXISTS "order_item_toppings" (
    "id"          TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "toppingId"   TEXT NOT NULL,
    "isRemoved"   BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "order_item_toppings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "order_item_toppings_orderItemId_toppingId_isRemoved_key"
    ON "order_item_toppings"("orderItemId", "toppingId", "isRemoved");

DO $$ BEGIN
  ALTER TABLE "order_item_toppings" ADD CONSTRAINT "order_item_toppings_orderItemId_fkey"
    FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "order_item_toppings" ADD CONSTRAINT "order_item_toppings_toppingId_fkey"
    FOREIGN KEY ("toppingId") REFERENCES "toppings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- order_item_half
CREATE TABLE IF NOT EXISTS "order_item_half" (
    "id"             TEXT NOT NULL,
    "orderItemId"    TEXT NOT NULL,
    "leftProductId"  TEXT NOT NULL,
    "rightProductId" TEXT NOT NULL,
    CONSTRAINT "order_item_half_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "order_item_half_orderItemId_key" ON "order_item_half"("orderItemId");

DO $$ BEGIN
  ALTER TABLE "order_item_half" ADD CONSTRAINT "order_item_half_orderItemId_fkey"
    FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "order_item_half" ADD CONSTRAINT "order_item_half_leftProductId_fkey"
    FOREIGN KEY ("leftProductId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "order_item_half" ADD CONSTRAINT "order_item_half_rightProductId_fkey"
    FOREIGN KEY ("rightProductId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- coupons
CREATE TABLE IF NOT EXISTS "coupons" (
    "id"            TEXT NOT NULL,
    "code"          TEXT NOT NULL,
    "description"   TEXT,
    "discountType"  "DiscountType" NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "minOrderTotal" DOUBLE PRECISION DEFAULT 0,
    "isActive"      BOOLEAN NOT NULL DEFAULT true,
    "startsAt"      TIMESTAMP(3),
    "endsAt"        TIMESTAMP(3),
    "usageLimit"    INTEGER,
    "perUserLimit"  INTEGER,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "coupons_code_key" ON "coupons"("code");

-- coupon_usages (may already exist from 20260214 migration)
CREATE TABLE IF NOT EXISTS "coupon_usages" (
    "id"       TEXT NOT NULL,
    "userId"   TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "orderId"  TEXT,
    "usedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "coupon_usages_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "coupon_usages_userId_couponId_idx" ON "coupon_usages"("userId", "couponId");

DO $$ BEGIN
  ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_couponId_fkey"
    FOREIGN KEY ("couponId") REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- deals
CREATE TABLE IF NOT EXISTS "deals" (
    "id"            TEXT NOT NULL,
    "title"         TEXT NOT NULL,
    "description"   TEXT,
    "imageUrl"      TEXT,
    "discountType"  "DiscountType" NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "isActive"      BOOLEAN NOT NULL DEFAULT true,
    "startsAt"      TIMESTAMP(3),
    "endsAt"        TIMESTAMP(3),
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- deal_items
CREATE TABLE IF NOT EXISTS "deal_items" (
    "id"        TEXT NOT NULL,
    "dealId"    TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "itemType"  "DealItemType" NOT NULL,
    "quantity"  INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "deal_items_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "deal_items_dealId_productId_itemType_key"
    ON "deal_items"("dealId", "productId", "itemType");

DO $$ BEGIN
  ALTER TABLE "deal_items" ADD CONSTRAINT "deal_items_dealId_fkey"
    FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "deal_items" ADD CONSTRAINT "deal_items_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- payments
CREATE TABLE IF NOT EXISTS "payments" (
    "id"          TEXT NOT NULL,
    "orderId"     TEXT NOT NULL,
    "provider"    "PaymentProvider" NOT NULL,
    "externalId"  TEXT,
    "amount"      DOUBLE PRECISION NOT NULL,
    "status"      "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "redirectUrl" TEXT,
    "metadata"    JSONB,
    "paidAt"      TIMESTAMP(3),
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "payments_orderId_provider_idx"   ON "payments"("orderId", "provider");
CREATE INDEX IF NOT EXISTS "payments_externalId_provider_idx" ON "payments"("externalId", "provider");

DO $$ BEGIN
  ALTER TABLE "payments" ADD CONSTRAINT "payments_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Notification
CREATE TABLE IF NOT EXISTS "Notification" (
    "id"        SERIAL NOT NULL,
    "userId"    TEXT NOT NULL,
    "title"     TEXT NOT NULL,
    "message"   TEXT NOT NULL,
    "type"      "NotificationType" NOT NULL DEFAULT 'INFO',
    "isRead"    BOOLEAN NOT NULL DEFAULT false,
    "orderId"   TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS "Notification_isRead_idx"  ON "Notification"("isRead");

DO $$ BEGIN
  ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- addresses
CREATE TABLE IF NOT EXISTS "addresses" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "label"     TEXT NOT NULL,
    "street"    TEXT NOT NULL,
    "building"  TEXT,
    "apartment" TEXT,
    "floor"     TEXT,
    "entrance"  TEXT,
    "landmark"  TEXT,
    "lat"       DOUBLE PRECISION,
    "lng"       DOUBLE PRECISION,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "addresses_userId_idx" ON "addresses"("userId");

DO $$ BEGIN
  ALTER TABLE "addresses" ADD CONSTRAINT "addresses_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- push_subscriptions
CREATE TABLE IF NOT EXISTS "push_subscriptions" (
    "id"         TEXT NOT NULL,
    "userId"     TEXT NOT NULL,
    "endpoint"   TEXT NOT NULL,
    "p256dh"     TEXT NOT NULL,
    "auth"       TEXT NOT NULL,
    "userAgent"  TEXT,
    "isActive"   BOOLEAN NOT NULL DEFAULT true,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");
CREATE INDEX IF NOT EXISTS "push_subscriptions_userId_idx"   ON "push_subscriptions"("userId");
CREATE INDEX IF NOT EXISTS "push_subscriptions_isActive_idx" ON "push_subscriptions"("isActive");

DO $$ BEGIN
  ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- loyalty_transactions (may already exist from 20260214 migration)
CREATE TABLE IF NOT EXISTS "loyalty_transactions" (
    "id"          TEXT NOT NULL,
    "userId"      TEXT NOT NULL,
    "type"        "LoyaltyTransactionType" NOT NULL,
    "points"      INTEGER NOT NULL,
    "orderId"     TEXT,
    "description" TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "loyalty_transactions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "loyalty_transactions_userId_idx" ON "loyalty_transactions"("userId");

DO $$ BEGIN
  ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
