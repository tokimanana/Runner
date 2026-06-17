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
