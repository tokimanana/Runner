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
