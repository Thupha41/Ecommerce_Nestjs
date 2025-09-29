/*
  Warnings:

  - You are about to drop the `_OrderDiscount` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_OrderDiscount" DROP CONSTRAINT "_OrderDiscount_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_OrderDiscount" DROP CONSTRAINT "_OrderDiscount_B_fkey";

-- DropTable
DROP TABLE "public"."_OrderDiscount";

-- CreateTable
CREATE TABLE "public"."_DiscountToOrder" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_DiscountToOrder_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_DiscountToOrder_B_index" ON "public"."_DiscountToOrder"("B");

-- AddForeignKey
ALTER TABLE "public"."_DiscountToOrder" ADD CONSTRAINT "_DiscountToOrder_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_DiscountToOrder" ADD CONSTRAINT "_DiscountToOrder_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
