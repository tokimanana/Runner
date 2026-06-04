-- CreateTable
CREATE TABLE "MealPlan" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tourOperatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MealPlan_tourOperatorId_idx" ON "MealPlan"("tourOperatorId");

-- CreateIndex
CREATE UNIQUE INDEX "MealPlan_tourOperatorId_code_key" ON "MealPlan"("tourOperatorId", "code");
