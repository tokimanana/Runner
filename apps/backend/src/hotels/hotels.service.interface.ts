import { AgeCategory, RoomType } from '@prisma/client';
import { CreateAgeCategoryDto } from './dto/create-age-category.dto';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateAgeCategoryDto } from './dto/update-age-category.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';
import { HotelDetail, HotelQuery, PaginatedResult } from './hotels.types';

export interface IHotelsService {
  create(data: CreateHotelDto, tourOperatorId: string): Promise<HotelDetail>;
  findAll(
    tourOperatorId: string,
    query: HotelQuery,
  ): Promise<PaginatedResult<HotelDetail>>;
  findOne(id: string, tourOperatorId: string): Promise<HotelDetail>;
  update(
    id: string,
    data: UpdateHotelDto,
    tourOperatorId: string,
  ): Promise<HotelDetail>;
  remove(id: string, tourOperatorId: string): Promise<void>;

  findAllAgeCategories(
    tourOperatorId: string,
    hotelId: string,
  ): Promise<AgeCategory[]>;
  createAgeCategory(
    data: CreateAgeCategoryDto,
    tourOperatorId: string,
    hotelId: string,
  ): Promise<AgeCategory>;
  updateAgeCategory(
    id: string,
    data: UpdateAgeCategoryDto,
    tourOperatorId: string,
    hotelId: string,
  ): Promise<AgeCategory>;
  removeAgeCategory(
    id: string,
    tourOperatorId: string,
    hotelId: string,
  ): Promise<void>;

  findAllRoomTypes(
    tourOperatorId: string,
    hotelId: string,
  ): Promise<RoomType[]>;
  createRoomType(
    data: CreateRoomTypeDto,
    tourOperatorId: string,
    hotelId: string,
  ): Promise<RoomType>;
  updateRoomType(
    id: string,
    data: UpdateRoomTypeDto,
    tourOperatorId: string,
    hotelId: string,
  ): Promise<RoomType>;
  removeRoomType(
    id: string,
    tourOperatorId: string,
    hotelId: string,
  ): Promise<void>;
}
