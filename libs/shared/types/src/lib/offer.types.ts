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
