/*
  Warnings:

  - A unique constraint covering the columns `[contractPeriodId,roomTypeId,ageCategoryId,sharingType]` on the table `age_policies` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roomTypeId` to the `age_policies` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "age_policies_contractPeriodId_ageCategoryId_sharingType_key";

-- AlterTable
ALTER TABLE "age_policies" ADD COLUMN     "roomTypeId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "age_policies_roomTypeId_idx" ON "age_policies"("roomTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "age_policies_contractPeriodId_roomTypeId_ageCategoryId_shar_key" ON "age_policies"("contractPeriodId", "roomTypeId", "ageCategoryId", "sharingType");

-- AddForeignKey
ALTER TABLE "age_policies" ADD CONSTRAINT "age_policies_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
