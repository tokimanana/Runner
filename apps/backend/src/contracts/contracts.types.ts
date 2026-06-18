import { PaginationQuery } from '@backend/common/pagination.types';

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
