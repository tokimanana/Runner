import { PaginationQuery } from '@backend/common/pagination.types';
import { PricingMode } from '@prisma/client';

export interface ContractQuery extends PaginationQuery {
  hotelId?: string;
  marketId?: string;
}

export interface ContractPeriodCreateData {
  seasonPeriodId?: string | null;
  name: string;
  startDate: Date;
  endDate: Date;
  baseMealPlanId: string;
  minStay?: number;
}

export interface ContractPeriodUpdateData {
  seasonPeriodId?: string | null;
  name?: string;
  startDate?: Date;
  endDate?: Date;
  baseMealPlanId?: string;
  minStay?: number | null;
}

export interface RoomPriceCreateData {
  roomTypeId: string;
  pricingMode: PricingMode;
  pricePerNight?: number | null;
}

export interface RoomPriceUpdateData {
  roomTypeId?: string;
  pricingMode?: PricingMode;
  pricePerNight?: number | null;
}

export interface OccupancyRateCreateData {
  numAdults: number;
  numChildren: number;
  ratesPerAge: Record<string, number>;
  totalRate: number;
}

export interface MealPlanSupplementCreateData {
  mealPlanId: string;
  occupancyRates: Record<string, number>;
}

export interface MealPlanSupplementUpdateData {
  mealPlanId?: string;
  occupancyRates?: Record<string, number>;
}

export interface StopSalesDateCreateData {
  date: Date;
}
