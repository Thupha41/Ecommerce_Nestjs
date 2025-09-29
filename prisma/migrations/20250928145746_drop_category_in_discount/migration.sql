/*
  Warnings:

  - You are about to drop the column `category` on the `Discount` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Discount" DROP COLUMN "category";

-- DropEnum
DROP TYPE "public"."DiscountCategory";
