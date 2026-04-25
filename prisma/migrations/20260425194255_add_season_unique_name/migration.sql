/*
  Warnings:

  - A unique constraint covering the columns `[tourOperatorId,name]` on the table `Season` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Season_tourOperatorId_name_key" ON "Season"("tourOperatorId", "name");
