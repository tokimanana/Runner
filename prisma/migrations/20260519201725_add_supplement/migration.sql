-- CreateEnum
CREATE TYPE "SupplementUnit" AS ENUM ('PER_PERSON_PER_NIGHT', 'PER_PERSON_PER_STAY', 'PER_ROOM_PER_NIGHT', 'PER_ROOM_PER_STAY');

-- CreateTable
CREATE TABLE "Supplement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "unit" "SupplementUnit" NOT NULL,
    "canReceiveDiscount" BOOLEAN NOT NULL DEFAULT false,
    "tourOperatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Supplement_tourOperatorId_idx" ON "Supplement"("tourOperatorId");
