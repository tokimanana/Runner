-- CreateEnum
CREATE TYPE "OfferType" AS ENUM ('PERCENTAGE', 'FLAT_AMOUNT');

-- CreateEnum
CREATE TYPE "DiscountMode" AS ENUM ('SEQUENTIAL', 'ADDITIVE');

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "OfferType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "discountMode" "DiscountMode" NOT NULL,
    "applyToRoomOnly" BOOLEAN NOT NULL DEFAULT false,
    "applyToMealSupplements" BOOLEAN NOT NULL DEFAULT false,
    "minStay" INTEGER,
    "tourOperatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Offer_tourOperatorId_idx" ON "Offer"("tourOperatorId");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_tourOperatorId_code_key" ON "Offer"("tourOperatorId", "code");
