export interface AgeCategory {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
  hotelId: string;
}

export interface RoomType {
  id: string;
  name: string;
  code: string;
  capacities?: RoomTypeCapacity[];
}

export interface RoomTypeCapacity {
  id: string;
  roomTypeId: string;
  ageCategoryId: string;
  maxPax: number;
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
export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  tourOperatorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MealPlan {
  id: string;
  code: string;
  name: string;
  description?: string;
  tourOperatorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Market {
  id: string;
  code: string;
  name: string;
  tourOperatorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
}

export type SupplementUnit =
  | 'PER_PERSON_PER_NIGHT'
  | 'PER_PERSON_PER_STAY'
  | 'PER_ROOM_PER_NIGHT'
  | 'PER_ROOM_PER_STAY';

export interface Supplement {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit: SupplementUnit;
  canReceiveDiscount: boolean;
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

export interface PaginationParams {
  limit?: number;
  offset?: number;
  search?: string;
}

export interface HotelDto {
  code: string;
  name: string;
  city: string;
  country: string;
  region?: string;
  destination?: string;
  address?: string;
  email?: string;
  phone?: string;
}

export interface AgeCategoryDto {
  name: string;
  minAge: number;
  maxAge: number;
}

export interface RoomTypeDto {
  code: string;
  name: string;
}

export interface SeasonDto {
  name: string;
  startDate: string;
  endDate: string;
}

export interface RoomTypeCapacityDto {
  ageCategoryId: string;
  maxPax: number;
}

export interface MealPlanDto {
  code: string;
  name: string;
  description?: string;
}

export interface MarketDto {
  code: string;
  name: string;
}

export interface CurrencyDto {
  code: string;
  name: string;
  symbol: string;
}

export interface SupplementDto {
  name: string;
  description?: string;
  price: number;
  unit: SupplementUnit;
  canReceiveDiscount: boolean;
}
