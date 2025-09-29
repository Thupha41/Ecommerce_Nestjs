-- CreateTable
CREATE TABLE "public"."DiscountTranslation" (
    "id" SERIAL NOT NULL,
    "discountId" INTEGER NOT NULL,
    "languageId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscountTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DiscountTranslation_deletedAt_idx" ON "public"."DiscountTranslation"("deletedAt");

-- CreateIndex
CREATE INDEX "DiscountTranslation_discountId_idx" ON "public"."DiscountTranslation"("discountId");

-- AddForeignKey
ALTER TABLE "public"."DiscountTranslation" ADD CONSTRAINT "DiscountTranslation_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "public"."Discount"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."DiscountTranslation" ADD CONSTRAINT "DiscountTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "public"."Language"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."DiscountTranslation" ADD CONSTRAINT "DiscountTranslation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."DiscountTranslation" ADD CONSTRAINT "DiscountTranslation_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."DiscountTranslation" ADD CONSTRAINT "DiscountTranslation_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;


CREATE UNIQUE INDEX "DiscountTranslation_discountId_languageId_unique"
ON "DiscountTranslation" ("discountId", "languageId")
WHERE "deletedAt" IS NULL;