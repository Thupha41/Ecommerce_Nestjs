/*
  Warnings:

  - You are about to drop the column `createdById` on the `DeliveryInfo` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `DeliveryInfo` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."DeliveryInfo" DROP CONSTRAINT "DeliveryInfo_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."DeliveryInfo" DROP CONSTRAINT "DeliveryInfo_updatedById_fkey";

-- AlterTable
ALTER TABLE "public"."DeliveryInfo" DROP COLUMN "createdById",
DROP COLUMN "updatedById";
