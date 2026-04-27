import { DeleteResult, PaginatedResult } from '@runner/shared/types';

export { DeleteResult, PaginatedResult };

export interface SeasonQuery {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}
