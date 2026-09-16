/*
  Warnings:

  - A unique constraint covering the columns `[contractId,name]` on the table `ContractPeriod` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ContractPeriod_contractId_name_key" ON "ContractPeriod"("contractId", "name");
