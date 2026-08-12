import {
  BaseRateReference,
  PricingMode,
  SharingType,
} from '@runner/shared/types';

export interface LocalContractPeriod {
  tempId: string;
  seasonPeriodId: string | null;
  name: string;
  startDate: Date | null;
  endDate: Date | null;
  baseMealPlanId: string;
  minStay?: number;
}

export interface LocalBaseRate {
  single: number | null;
  halfDouble: number | null;
  thirdPersonAdult: number | null;
  triple: number | null;
  quadruple: number | null;
}

export function emptyBaseRate(): LocalBaseRate {
  return {
    single: null,
    halfDouble: null,
    thirdPersonAdult: null,
    triple: null,
    quadruple: null,
  };
}

export interface LocalRoomPrice {
  tempId: string;
  periodTempId: string;
  roomTypeId: string;
  pricingMode: PricingMode;
  pricePerNight: number | null;
  baseRate: LocalBaseRate | null;
}
export interface LocalAgePolicyEntry {
  tempId: string;
  periodTempId: string;
  roomTypeId: string;
  ageCategoryId: string;
  sharingType: SharingType;
  occurrenceIndex: number;
  baseRateReference: BaseRateReference;
  value: number | null;
}
