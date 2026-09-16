-- CreateEnum
CREATE TYPE "SharingType" AS ENUM ('WITH_PARENTS', 'SEPARATE_ROOM');

-- CreateEnum
CREATE TYPE "BillingUnit" AS ENUM ('PER_NIGHT', 'PER_STAY');

-- AlterTable
ALTER TABLE "MealPlanSupplement" ADD COLUMN     "billingUnit" "BillingUnit" NOT NULL DEFAULT 'PER_NIGHT';

-- CreateTable
CREATE TABLE "age_policies" (
    "id" TEXT NOT NULL,
    "contractPeriodId" TEXT NOT NULL,
    "ageCategoryId" TEXT NOT NULL,
    "sharingType" "SharingType" NOT NULL,
    "value" DECIMAL(10,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "age_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base_rates" (
    "id" TEXT NOT NULL,
    "contractPeriodId" TEXT NOT NULL,
    "roomTypeId" TEXT NOT NULL,
    "halfDouble" DECIMAL(10,2) NOT NULL,
    "single" DECIMAL(10,2) NOT NULL,
    "thirdPersonAdult" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "base_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "occupancy_guidances" (
    "id" TEXT NOT NULL,
    "roomTypeId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "maxAdults" INTEGER NOT NULL DEFAULT 0,
    "maxTeens" INTEGER NOT NULL DEFAULT 0,
    "maxChildren" INTEGER NOT NULL DEFAULT 0,
    "maxInfants" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "occupancy_guidances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "age_policies_contractPeriodId_idx" ON "age_policies"("contractPeriodId");

-- CreateIndex
CREATE INDEX "age_policies_ageCategoryId_idx" ON "age_policies"("ageCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "age_policies_contractPeriodId_ageCategoryId_sharingType_key" ON "age_policies"("contractPeriodId", "ageCategoryId", "sharingType");

-- CreateIndex
CREATE INDEX "base_rates_contractPeriodId_idx" ON "base_rates"("contractPeriodId");

-- CreateIndex
CREATE INDEX "base_rates_roomTypeId_idx" ON "base_rates"("roomTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "base_rates_contractPeriodId_roomTypeId_key" ON "base_rates"("contractPeriodId", "roomTypeId");

-- CreateIndex
CREATE INDEX "occupancy_guidances_roomTypeId_idx" ON "occupancy_guidances"("roomTypeId");

-- AddForeignKey
ALTER TABLE "age_policies" ADD CONSTRAINT "age_policies_contractPeriodId_fkey" FOREIGN KEY ("contractPeriodId") REFERENCES "ContractPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "age_policies" ADD CONSTRAINT "age_policies_ageCategoryId_fkey" FOREIGN KEY ("ageCategoryId") REFERENCES "AgeCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base_rates" ADD CONSTRAINT "base_rates_contractPeriodId_fkey" FOREIGN KEY ("contractPeriodId") REFERENCES "ContractPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base_rates" ADD CONSTRAINT "base_rates_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occupancy_guidances" ADD CONSTRAINT "occupancy_guidances_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
