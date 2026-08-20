-- CreateTable
CREATE TABLE "OfferSupplement" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "supplementId" TEXT NOT NULL,
    "applyDiscount" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OfferSupplement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OfferSupplement_offerId_idx" ON "OfferSupplement"("offerId");

-- CreateIndex
CREATE UNIQUE INDEX "OfferSupplement_offerId_supplementId_key" ON "OfferSupplement"("offerId", "supplementId");

-- AddForeignKey
ALTER TABLE "OfferSupplement" ADD CONSTRAINT "OfferSupplement_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferSupplement" ADD CONSTRAINT "OfferSupplement_supplementId_fkey" FOREIGN KEY ("supplementId") REFERENCES "Supplement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
