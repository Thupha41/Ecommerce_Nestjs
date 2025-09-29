-- CreateEnum
CREATE TYPE "public"."DiscountCategory" AS ENUM ('FREESHIP', 'ORDER_VALUE', 'SKU_SPECIFIC', 'GENERAL');

-- AlterTable
ALTER TABLE "public"."Discount" ADD COLUMN     "category" "public"."DiscountCategory" NOT NULL DEFAULT 'GENERAL';
