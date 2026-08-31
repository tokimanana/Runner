export interface OfferPeriodCreateData {
  startDate: Date;
  endDate: Date;
}

export interface OfferPeriodUpdateData {
  startDate?: Date;
  endDate?: Date;
}

export interface CompatibilityResult {
  compatible: boolean;
  reason?: string;
}
