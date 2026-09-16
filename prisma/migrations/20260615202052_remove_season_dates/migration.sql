/*
  Warnings:

  - You are about to drop the column `endDate` on the `Season` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Season` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Season_startDate_endDate_idx";

-- AlterTable
ALTER TABLE "Season" DROP COLUMN "endDate",
DROP COLUMN "startDate";
