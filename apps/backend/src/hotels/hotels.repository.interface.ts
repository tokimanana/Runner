import { AgeCategory, RoomType } from '@prisma/client';
import { CreateAgeCategoryDto } from './dto/create-age-category.dto';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateAgeCategoryDto } from './dto/update-age-category.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';
import {
  HotelDeleteResult,
  HotelDetail,
  HotelQuery,
  PaginatedResult,
} from './hotels.types';

export interface IHotelRepository {
  create(data: CreateHotelDto, tourOperatorId: string): Promise<HotelDetail>;
  findAll(
    tourOperatorId: string,
    query: HotelQuery,
  ): Promise<PaginatedResult<HotelDetail>>;
  findById(id: string): Promise<HotelDetail | null>;
  update(
    id: string,
    tourOperatorId: string,
    data: UpdateHotelDto,
  ): Promise<HotelDetail | null>;
  delete(id: string, tourOperatorId: string): Promise<HotelDeleteResult>;

  findAllAgeCategories(hotelId: string): Promise<AgeCategory[]>;
  createAgeCategory(
    hotelId: string,
    data: CreateAgeCategoryDto,
  ): Promise<AgeCategory>;
  findAgeCategoryById(id: string): Promise<AgeCategory | null>;
  updateAgeCategory(
    id: string,
    data: UpdateAgeCategoryDto,
  ): Promise<AgeCategory>;
  deleteAgeCategory(id: string): Promise<void>;
  findOverlappingAgeCategory(
    hotelId: string,
    minAge: number,
    maxAge: number,
    excludeId?: string,
  ): Promise<AgeCategory | null>;

  findAllRoomTypes(hotelId: string): Promise<RoomType[]>;
  createRoomType(hotelId: string, data: CreateRoomTypeDto): Promise<RoomType>;
  findRoomTypeById(id: string): Promise<RoomType | null>;
  updateRoomType(id: string, data: UpdateRoomTypeDto): Promise<RoomType>;
  deleteRoomType(id: string): Promise<boolean>;
  findRoomTypeByCode(
    hotelId: string,
    code: string,
    excludeId?: string,
  ): Promise<RoomType | null>;
}
