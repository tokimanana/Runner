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

export interface RoomTypeDto {
  code: string;
  name: string;
}

export interface RoomTypeCapacityDto {
  ageCategoryId: string;
  maxPax: number;
}

export interface OccupancyGuidance {
  id: string;
  roomTypeId: string;
  description: string;
  maxAdults: number;
  maxTeens: number;
  maxChildren: number;
  maxInfants: number;
}

export interface OccupancyGuidanceDto {
  roomTypeId: string;
  description: string;
  maxAdults?: number;
  maxTeens?: number;
  maxChildren?: number;
  maxInfants?: number;
}
