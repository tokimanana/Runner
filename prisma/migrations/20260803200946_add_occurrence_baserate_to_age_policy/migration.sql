/*
  Warnings:

  - A unique constraint covering the columns `[contractPeriodId,roomTypeId,ageCategoryId,sharingType,occurrenceIndex]` on the table `age_policies` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `baseRateReference` to the `age_policies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `occurrenceIndex` to the `age_policies` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BaseRateReference" AS ENUM ('single', 'halfDouble', 'triple', 'quadruple');

-- DropIndex
DROP INDEX "age_policies_contractPeriodId_roomTypeId_ageCategoryId_shar_key";

-- AlterTable
ALTER TABLE "age_policies" ADD COLUMN     "baseRateReference" "BaseRateReference" NOT NULL,
ADD COLUMN     "occurrenceIndex" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "age_policies_contractPeriodId_roomTypeId_ageCategoryId_shar_key" ON "age_policies"("contractPeriodId", "roomTypeId", "ageCategoryId", "sharingType", "occurrenceIndex");
