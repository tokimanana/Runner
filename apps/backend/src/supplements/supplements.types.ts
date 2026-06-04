import { SupplementUnit } from '@prisma/client';

export interface SupplementQuery {
  limit?: number;
  offset?: number;
  unit?: SupplementUnit;
}
