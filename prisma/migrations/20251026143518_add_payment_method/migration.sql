/*
  Warnings:

  - Added the required column `paymentMethod` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('CASH', 'BANK');

-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "paymentMethod" "public"."PaymentMethod" NOT NULL;
