import { AgeCategory } from './age-category.types';
import { RoomType } from './room-type.types';

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
