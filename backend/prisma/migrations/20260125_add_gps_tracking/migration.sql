-- GPS Tracking Migration
-- Add GPS tracking fields to orders table
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "deliveryLocation" JSONB;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "driverLocation" JSONB;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "estimatedTime" INTEGER;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "actualDistance" DOUBLE PRECISION;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "trackingStartedAt" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "deliveryStartedAt" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "deliveryCompletedAt" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "driverId" TEXT;

-- Add driver fields to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isDriver" BOOLEAN DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "driverStatus" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "currentLocation" JSONB;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "vehicleType" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "vehicleNumber" TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS "orders_driverId_idx" ON "orders"("driverId");
CREATE INDEX IF NOT EXISTS "users_isDriver_idx" ON "users"("isDriver");
CREATE INDEX IF NOT EXISTS "users_driverStatus_idx" ON "users"("driverStatus");

-- Add foreign key
ALTER TABLE "orders" ADD CONSTRAINT "orders_driverId_fkey" 
FOREIGN KEY ("driverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;