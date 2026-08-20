-- CreateTable
CREATE TABLE "OfferPeriod" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfferPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OfferPeriod_offerId_idx" ON "OfferPeriod"("offerId");

-- AddForeignKey
ALTER TABLE "OfferPeriod" ADD CONSTRAINT "OfferPeriod_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
