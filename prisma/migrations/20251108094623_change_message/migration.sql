/*
  Warnings:

  - You are about to drop the column `readAt` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `toUserId` on the `Message` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_toUserId_fkey";

-- AlterTable
ALTER TABLE "public"."Message" DROP COLUMN "readAt",
DROP COLUMN "toUserId",
ADD COLUMN     "metadata" JSONB;
