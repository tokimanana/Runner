import { PaginationQuery } from '@backend/common/pagination.types';
import {
  BaseRateReference,
  BillingUnit,
  PricingMode,
  SharingType,
} from '@prisma/client';

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
  extraPersonAdult?: number | null;
  extraPersonChild?: number | null;
  extraPersonTeen?: number | null;
}

export interface RoomPriceUpdateData {
  roomTypeId?: string;
  pricingMode?: PricingMode;
  pricePerNight?: number | null;
  extraPersonAdult?: number | null;
  extraPersonChild?: number | null;
  extraPersonTeen?: number | null;
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
  billingUnit: BillingUnit;
}

export interface MealPlanSupplementUpdateData {
  mealPlanId?: string;
  occupancyRates?: Record<string, number>;
  billingUnit?: BillingUnit;
}

export interface StopSalesDateCreateData {
  date: Date;
}

export interface BaseRateCreateData {
  roomTypeId: string;
  halfDouble: number;
  single: number;
  thirdPersonAdult?: number | null;
  triple?: number | null;
  quadruple?: number | null;
}

export type BaseRateUpdateData = Partial<BaseRateCreateData>;

export interface AgePolicyCreateData {
  roomTypeId: string;
  ageCategoryId: string;
  sharingType: SharingType;
  occurrenceIndex: number;
  baseRateReference: BaseRateReference;
  value: number;
}

export type AgePolicyUpdateData = Partial<AgePolicyCreateData>;

export interface OccupancyGuidanceCreateData {
  roomTypeId: string;
  description: string;
  maxAdults?: number;
  maxTeens?: number;
  maxChildren?: number;
  maxInfants?: number;
}

export type OccupancyGuidanceUpdateData = Partial<OccupancyGuidanceCreateData>;
