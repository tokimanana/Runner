import { SeasonPeriod } from './season.types';

export type PricingMode = 'PER_ROOM' | 'PER_OCCUPANCY';
export type SharingType = 'WITH_PARENTS' | 'SEPARATE_ROOM';
export type BaseRateReference =
  | 'single'
  | 'halfDouble'
  | 'triple'
  | 'quadruple';
export interface Contract {
  id: string;
  name: string;
  hotelId: string;
  marketId: string;
  currencyId: string;
  tourOperatorId: string;
  hotel?: { id: string; name: string };
  market?: { id: string; name: string };
  currency?: { id: string; code: string; symbol: string };
  periods?: ContractPeriod[];
  periodsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContractDto {
  name: string;
  hotelId: string;
  marketId: string;
  currencyId: string;
}

export interface ContractPeriod {
  id: string;
  contractId: string;
  seasonPeriodId?: string | null;
  name: string;
  startDate: string;
  endDate: string;
  baseMealPlanId: string;
  minStay?: number;
  seasonPeriod?: SeasonPeriod;
  baseMealPlan?: { id: string; code: string; name: string };
  roomPrices?: RoomPrice[];
  mealPlanSupplements?: MealPlanSupplement[];
  stopSalesDates?: StopSalesDate[];
  baseRates?: BaseRate[];
  agePolicies?: AgePolicy[];
}

export interface ContractPeriodDto {
  seasonPeriodId?: string | null;
  name: string;
  startDate: string;
  endDate: string;
  baseMealPlanId: string;
  minStay?: number;
}

export interface OccupancyRate {
  id: string;
  roomPriceId: string;
  numAdults: number;
  numChildren: number;
  ratesPerAge: Record<string, number>;
  totalRate: number;
}

export interface RoomPrice {
  id: string;
  contractPeriodId: string;
  roomTypeId: string;
  pricingMode: PricingMode;
  pricePerNight: number | null;
  extraPersonAdult: number | null;
  extraPersonChild: number | null;
  extraPersonTeen: number | null;
  roomType?: { id: string; name: string; code: string };
  occupancyRates?: OccupancyRate[];
}

export interface RoomPriceDto {
  roomTypeId: string;
  pricingMode: PricingMode;
  pricePerNight?: number | null;
  extraPersonAdult?: number | null;
  extraPersonChild?: number | null;
  extraPersonTeen?: number | null;
  occupancyRates?: OccupancyRateDto[];
}

export interface OccupancyRateDto {
  numAdults: number;
  numChildren: number;
  ratesPerAge: Record<string, number>;
}

export interface MealPlanSupplement {
  id: string;
  contractPeriodId: string;
  mealPlanId: string;
  occupancyRates: Record<string, number>;
  mealPlan?: { id: string; code: string; name: string };
}

export interface MealPlanSupplementDto {
  mealPlanId: string;
  occupancyRates: Record<string, number>;
}

export interface StopSalesDate {
  id: string;
  contractPeriodId: string;
  date: string;
}

export interface ContractFilters {
  hotelId?: string;
  marketId?: string;
}

export interface BaseRate {
  id: string;
  contractPeriodId: string;
  roomTypeId: string;
  halfDouble: number;
  single: number;
  thirdPersonAdult: number | null;
  triple: number | null;
  quadruple: number | null;
  roomType?: { id: string; name: string; code: string };
}

export interface AgePolicy {
  id: string;
  contractPeriodId: string;
  roomTypeId: string;
  ageCategoryId: string;
  sharingType: SharingType;
  occurrenceIndex: number;
  baseRateReference: BaseRateReference;
  value: number;
  roomType?: { id: string; name: string; code: string };
  ageCategory?: { id: string; name: string; minAge: number; maxAge: number };
}
