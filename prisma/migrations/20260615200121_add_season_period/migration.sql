-- CreateTable
CREATE TABLE "SeasonPeriod" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeasonPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SeasonPeriod_seasonId_idx" ON "SeasonPeriod"("seasonId");

-- CreateIndex
CREATE INDEX "SeasonPeriod_startDate_endDate_idx" ON "SeasonPeriod"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "SeasonPeriod_seasonId_name_key" ON "SeasonPeriod"("seasonId", "name");

-- AddForeignKey
ALTER TABLE "SeasonPeriod" ADD CONSTRAINT "SeasonPeriod_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;
