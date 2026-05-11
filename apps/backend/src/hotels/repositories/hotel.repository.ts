import { RepositoryResult } from '@backend/common/repository.types';
import { AgeCategory, RoomType, RoomTypeCapacity } from '@prisma/client';
import { PaginatedResult } from '@runner/shared/types';
import { CreateAgeCategoryDto } from '../dto/create-age-category.dto';
import { CreateHotelDto } from '../dto/create-hotel.dto';
import { CreateRoomTypeCapacityDto } from '../dto/create-room-type-capacity.dto';
import { CreateRoomTypeDto } from '../dto/create-room-type.dto';
import { UpdateAgeCategoryDto } from '../dto/update-age-category.dto';
import { UpdateHotelDto } from '../dto/update-hotel.dto';
import { UpdateRoomTypeCapacityDto } from '../dto/update-room-type-capacity.dto';
import { UpdateRoomTypeDto } from '../dto/update-room-type.dto';
import { HotelDetail, HotelQuery } from '../hotels.types';

export abstract class HotelRepository {
  abstract create(
    data: CreateHotelDto,
    tourOperatorId: string,
  ): Promise<HotelDetail>;
  abstract findAll(
    tourOperatorId: string,
    query: HotelQuery,
  ): Promise<PaginatedResult<HotelDetail>>;
  abstract findById(id: string): Promise<HotelDetail | null>;
  abstract update(
    id: string,
    tourOperatorId: string,
    data: UpdateHotelDto,
  ): Promise<HotelDetail | null>;
  abstract delete(
    id: string,
    tourOperatorId: string,
  ): Promise<RepositoryResult>;

  abstract findAllAgeCategories(hotelId: string): Promise<AgeCategory[]>;
  abstract createAgeCategory(
    hotelId: string,
    data: CreateAgeCategoryDto,
  ): Promise<AgeCategory>;
  abstract findAgeCategoryById(id: string): Promise<AgeCategory | null>;
  abstract updateAgeCategory(
    id: string,
    data: UpdateAgeCategoryDto,
  ): Promise<AgeCategory>;
  abstract deleteAgeCategory(id: string): Promise<RepositoryResult>;
  abstract findOverlappingAgeCategory(
    hotelId: string,
    minAge: number,
    maxAge: number,
    excludeId?: string,
  ): Promise<AgeCategory | null>;

  abstract findAllRoomTypes(hotelId: string): Promise<RoomType[]>;
  abstract createRoomType(
    hotelId: string,
    data: CreateRoomTypeDto,
  ): Promise<RoomType>;
  abstract findRoomTypeById(id: string): Promise<RoomType | null>;
  abstract updateRoomType(
    id: string,
    data: UpdateRoomTypeDto,
  ): Promise<RoomType>;
  abstract deleteRoomType(id: string): Promise<RepositoryResult>;
  abstract findRoomTypeByCode(
    hotelId: string,
    code: string,
    excludeId?: string,
  ): Promise<RoomType | null>;

  abstract createRoomTypeCapacity(
    roomTypeId: string,
    dto: CreateRoomTypeCapacityDto,
  ): Promise<RoomTypeCapacity | RepositoryResult.CONFLICT>;
  abstract updateRoomTypeCapacity(
    capacityId: string,
    dto: UpdateRoomTypeCapacityDto,
  ): Promise<RoomTypeCapacity>;
  abstract deleteRoomTypeCapacity(
    capacityId: string,
  ): Promise<RepositoryResult>;
  abstract findRoomTypeCapacityById(
    id: string,
  ): Promise<RoomTypeCapacity | null>;
}
