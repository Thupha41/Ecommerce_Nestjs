-- CreateTable
CREATE TABLE "public"."DeliveryInfo" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "provinceCity" VARCHAR(500) NOT NULL,
    "district" VARCHAR(500) NOT NULL,
    "ward" VARCHAR(500) NOT NULL,
    "street" VARCHAR(500) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeliveryInfo_userId_idx" ON "public"."DeliveryInfo"("userId");

-- CreateIndex
CREATE INDEX "DeliveryInfo_isDefault_idx" ON "public"."DeliveryInfo"("isDefault");

-- AddForeignKey
ALTER TABLE "public"."DeliveryInfo" ADD CONSTRAINT "DeliveryInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."DeliveryInfo" ADD CONSTRAINT "DeliveryInfo_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."DeliveryInfo" ADD CONSTRAINT "DeliveryInfo_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
