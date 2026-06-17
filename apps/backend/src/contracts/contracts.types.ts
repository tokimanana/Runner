import { PaginationQuery } from '@backend/common/pagination.types';

export interface ContractQuery extends PaginationQuery {
  hotelId?: string;
  marketId?: string;
}
