-- GPS Tracking Migration
-- Add GPS tracking fields to Order table
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveryLocation" JSONB;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "driverLocation" JSONB;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "estimatedTime" INTEGER;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "actualDistance" DOUBLE PRECISION;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "trackingStartedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveryStartedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveryCompletedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "driverId" TEXT;

-- Add driver fields to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isDriver" BOOLEAN DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "driverStatus" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "currentLocation" JSONB;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "vehicleType" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "vehicleNumber" TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS "Order_driverId_idx" ON "Order"("driverId");
CREATE INDEX IF NOT EXISTS "User_isDriver_idx" ON "User"("isDriver");
CREATE INDEX IF NOT EXISTS "User_driverStatus_idx" ON "User"("driverStatus");

-- Add foreign key
ALTER TABLE "Order" ADD CONSTRAINT "Order_driverId_fkey" 
FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;