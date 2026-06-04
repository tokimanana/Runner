/*
  Warnings:

  - You are about to drop the column `order` on the `AgeCategory` table. All the data in the column will be lost.
  - You are about to drop the column `maxAdults` on the `RoomType` table. All the data in the column will be lost.
  - You are about to drop the column `maxChildren` on the `RoomType` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AgeCategory" DROP COLUMN "order";

-- AlterTable
ALTER TABLE "RoomType" DROP COLUMN "maxAdults",
DROP COLUMN "maxChildren";

-- CreateTable
CREATE TABLE "RoomTypeCapacity" (
    "id" TEXT NOT NULL,
    "roomTypeId" TEXT NOT NULL,
    "ageCategoryId" TEXT NOT NULL,
    "maxPax" INTEGER NOT NULL,

    CONSTRAINT "RoomTypeCapacity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoomTypeCapacity_roomTypeId_ageCategoryId_key" ON "RoomTypeCapacity"("roomTypeId", "ageCategoryId");

-- AddForeignKey
ALTER TABLE "RoomTypeCapacity" ADD CONSTRAINT "RoomTypeCapacity_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomTypeCapacity" ADD CONSTRAINT "RoomTypeCapacity_ageCategoryId_fkey" FOREIGN KEY ("ageCategoryId") REFERENCES "AgeCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
