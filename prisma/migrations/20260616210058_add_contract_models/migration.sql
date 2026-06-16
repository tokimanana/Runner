-- CreateEnum
CREATE TYPE "PricingMode" AS ENUM ('PER_ROOM', 'PER_OCCUPANCY');

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "currencyId" TEXT NOT NULL,
    "tourOperatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractPeriod" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "seasonPeriodId" TEXT,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "baseMealPlanId" TEXT NOT NULL,
    "minStay" INTEGER,

    CONSTRAINT "ContractPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomPrice" (
    "id" TEXT NOT NULL,
    "contractPeriodId" TEXT NOT NULL,
    "roomTypeId" TEXT NOT NULL,
    "pricingMode" "PricingMode" NOT NULL,
    "pricePerNight" DECIMAL(65,30),

    CONSTRAINT "RoomPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OccupancyRate" (
    "id" TEXT NOT NULL,
    "roomPriceId" TEXT NOT NULL,
    "numAdults" INTEGER NOT NULL,
    "numChildren" INTEGER NOT NULL,
    "ratesPerAge" JSONB NOT NULL,
    "totalRate" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "OccupancyRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealPlanSupplement" (
    "id" TEXT NOT NULL,
    "contractPeriodId" TEXT NOT NULL,
    "mealPlanId" TEXT NOT NULL,
    "occupancyRates" JSONB NOT NULL,

    CONSTRAINT "MealPlanSupplement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StopSalesDate" (
    "id" TEXT NOT NULL,
    "contractPeriodId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StopSalesDate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Contract_tourOperatorId_idx" ON "Contract"("tourOperatorId");

-- CreateIndex
CREATE INDEX "Contract_hotelId_idx" ON "Contract"("hotelId");

-- CreateIndex
CREATE INDEX "Contract_marketId_idx" ON "Contract"("marketId");

-- CreateIndex
CREATE INDEX "ContractPeriod_contractId_idx" ON "ContractPeriod"("contractId");

-- CreateIndex
CREATE INDEX "ContractPeriod_seasonPeriodId_idx" ON "ContractPeriod"("seasonPeriodId");

-- CreateIndex
CREATE INDEX "RoomPrice_contractPeriodId_idx" ON "RoomPrice"("contractPeriodId");

-- CreateIndex
CREATE UNIQUE INDEX "RoomPrice_contractPeriodId_roomTypeId_key" ON "RoomPrice"("contractPeriodId", "roomTypeId");

-- CreateIndex
CREATE INDEX "OccupancyRate_roomPriceId_idx" ON "OccupancyRate"("roomPriceId");

-- CreateIndex
CREATE UNIQUE INDEX "OccupancyRate_roomPriceId_numAdults_numChildren_key" ON "OccupancyRate"("roomPriceId", "numAdults", "numChildren");

-- CreateIndex
CREATE INDEX "MealPlanSupplement_contractPeriodId_idx" ON "MealPlanSupplement"("contractPeriodId");

-- CreateIndex
CREATE UNIQUE INDEX "MealPlanSupplement_contractPeriodId_mealPlanId_key" ON "MealPlanSupplement"("contractPeriodId", "mealPlanId");

-- CreateIndex
CREATE INDEX "StopSalesDate_contractPeriodId_idx" ON "StopSalesDate"("contractPeriodId");

-- CreateIndex
CREATE UNIQUE INDEX "StopSalesDate_contractPeriodId_date_key" ON "StopSalesDate"("contractPeriodId", "date");

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractPeriod" ADD CONSTRAINT "ContractPeriod_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractPeriod" ADD CONSTRAINT "ContractPeriod_seasonPeriodId_fkey" FOREIGN KEY ("seasonPeriodId") REFERENCES "SeasonPeriod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractPeriod" ADD CONSTRAINT "ContractPeriod_baseMealPlanId_fkey" FOREIGN KEY ("baseMealPlanId") REFERENCES "MealPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomPrice" ADD CONSTRAINT "RoomPrice_contractPeriodId_fkey" FOREIGN KEY ("contractPeriodId") REFERENCES "ContractPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomPrice" ADD CONSTRAINT "RoomPrice_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OccupancyRate" ADD CONSTRAINT "OccupancyRate_roomPriceId_fkey" FOREIGN KEY ("roomPriceId") REFERENCES "RoomPrice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlanSupplement" ADD CONSTRAINT "MealPlanSupplement_contractPeriodId_fkey" FOREIGN KEY ("contractPeriodId") REFERENCES "ContractPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlanSupplement" ADD CONSTRAINT "MealPlanSupplement_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "MealPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StopSalesDate" ADD CONSTRAINT "StopSalesDate_contractPeriodId_fkey" FOREIGN KEY ("contractPeriodId") REFERENCES "ContractPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
