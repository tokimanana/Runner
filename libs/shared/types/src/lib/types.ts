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
