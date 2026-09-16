import { PaginationQuery } from '@backend/common/pagination.types';
import { SupplementUnit } from '@prisma/client';

export interface SupplementQuery extends PaginationQuery {
  unit?: SupplementUnit;
}
