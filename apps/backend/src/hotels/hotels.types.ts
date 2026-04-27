import { Prisma } from '@prisma/client';

export type HotelDetail = Prisma.HotelGetPayload<{
  include: { ageCategories: true; roomTypes: true };
}>;

export interface HotelQuery {
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export enum HotelDeleteResult {
  DELETED = 'DELETED',
  NOT_FOUND = 'NOT_FOUND',
  HAS_CONTRACTS = 'HAS_CONTRACTS',
}
