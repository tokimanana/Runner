import { SeasonPeriod } from './season.types';

export type PricingMode = 'PER_ROOM' | 'PER_OCCUPANCY';

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
  seasonPeriodId?: string | null; // optionnel — classification/reporting
  name: string;
  startDate: string; // source de vérité contractuelle
  endDate: string;
  baseMealPlanId: string;
  minStay?: number;
  seasonPeriod?: SeasonPeriod; // pour affichage du nom de saison
  baseMealPlan?: { id: string; code: string; name: string };
  roomPrices?: RoomPrice[];
  mealPlanSupplements?: MealPlanSupplement[];
  stopSalesDates?: StopSalesDate[];
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
  roomType?: { id: string; name: string; code: string };
  occupancyRates?: OccupancyRate[];
}

export interface RoomPriceDto {
  roomTypeId: string;
  pricingMode: PricingMode;
  pricePerNight?: number | null;
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
