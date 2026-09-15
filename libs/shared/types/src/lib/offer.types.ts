export type OfferType = 'PERCENTAGE' | 'FLAT_AMOUNT';
export type DiscountMode = 'SEQUENTIAL' | 'ADDITIVE';

export interface Offer {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: OfferType;
  value: number;
  discountMode: DiscountMode;
  applyToRoomOnly: boolean;
  applyToMealSupplements: boolean;
  minStay?: number;
  tourOperatorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfferDto {
  code: string;
  name: string;
  description?: string;
  type: OfferType;
  value: number;
  discountMode: DiscountMode;
  applyToRoomOnly: boolean;
  applyToMealSupplements: boolean;
  minStay?: number;
}

export interface OfferPeriod {
  id: string;
  offerId: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfferPeriodDto {
  startDate: string;
  endDate: string;
}

export interface OfferSupplement {
  id: string;
  offerId: string;
  supplementId: string;
  applyDiscount: boolean;
}

export interface OfferSupplementDto {
  supplementId: string;
  applyDiscount?: boolean;
}
