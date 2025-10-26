/*
  Warnings:

  - You are about to drop the column `shopId` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_shopId_fkey";

-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "shopId";
