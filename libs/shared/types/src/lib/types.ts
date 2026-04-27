export interface AgeCategory {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
  order: number;
  hotelId: string;
}

export interface RoomType {
  id: string;
  name: string;
  code: string;
  maxAdults: number;
  maxChildren: number;
  hotelId: string;
}

export interface Hotel {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  region?: string;
  destination?: string;
  address?: string;
  email?: string;
  phone?: string;
  tourOperatorId: string;
  ageCategories?: AgeCategory[];
  roomTypes?: RoomType[];
  createdAt: string;
  updatedAt: string;
}

// Season
export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  tourOperatorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export enum DeleteResult {
  DELETED = 'DELETED',
  NOT_FOUND = 'NOT_FOUND',
  HAS_CONTRACTS = 'HAS_CONTRACTS',
}
