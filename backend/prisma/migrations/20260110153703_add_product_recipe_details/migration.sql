-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "allergens" TEXT[],
ADD COLUMN     "calories" INTEGER,
ADD COLUMN     "carbs" DOUBLE PRECISION,
ADD COLUMN     "cookingSteps" JSONB,
ADD COLUMN     "cookingTemp" INTEGER,
ADD COLUMN     "cookingTime" INTEGER,
ADD COLUMN     "difficulty" TEXT,
ADD COLUMN     "fat" DOUBLE PRECISION,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "ingredients" JSONB,
ADD COLUMN     "protein" DOUBLE PRECISION,
ADD COLUMN     "recipe" TEXT,
ADD COLUMN     "servings" INTEGER;
