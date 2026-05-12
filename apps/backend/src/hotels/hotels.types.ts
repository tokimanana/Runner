import { Prisma } from '@prisma/client';

export type HotelDetail = Prisma.HotelGetPayload<{
  include: { ageCategories: true; roomTypes: true };
}>;

export interface HotelQuery {
  search?: string;
  limit?: number;
  offset?: number;
}
