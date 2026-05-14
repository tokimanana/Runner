-- CreateTable
CREATE TABLE "Market" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tourOperatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Market_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Market_tourOperatorId_idx" ON "Market"("tourOperatorId");

-- CreateIndex
CREATE UNIQUE INDEX "Market_tourOperatorId_code_key" ON "Market"("tourOperatorId", "code");
