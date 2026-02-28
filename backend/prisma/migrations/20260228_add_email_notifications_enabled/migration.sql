-- Add emailNotificationsEnabled to users table (default: true)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true;
