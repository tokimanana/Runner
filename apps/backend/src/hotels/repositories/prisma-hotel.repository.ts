import { RepositoryResult } from '@backend/common/repository.types';
import { Injectable } from '@nestjs/common';
import {
  AgeCategory,
  Prisma,
  RoomType,
  RoomTypeCapacity,
} from '@prisma/client';
import { PaginatedResult } from '@runner/shared/types';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAgeCategoryDto } from '../dto/create-age-category.dto';
import { CreateHotelDto } from '../dto/create-hotel.dto';
import { CreateRoomTypeCapacityDto } from '../dto/create-room-type-capacity.dto';
import { CreateRoomTypeDto } from '../dto/create-room-type.dto';
import { UpdateAgeCategoryDto } from '../dto/update-age-category.dto';
import { UpdateHotelDto } from '../dto/update-hotel.dto';
import { UpdateRoomTypeCapacityDto } from '../dto/update-room-type-capacity.dto';
import { UpdateRoomTypeDto } from '../dto/update-room-type.dto';
import { HotelDetail, HotelQuery } from '../hotels.types';
import { HotelRepository } from './hotel.repository';

const HOTEL_INCLUDE = {
  ageCategories: true,
  roomTypes: {
    include: {
      capacities: {
        include: { ageCategory: true },
      },
    },
  },
} satisfies Prisma.HotelInclude;

@Injectable()
export class PrismaHotelRepository implements HotelRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateHotelDto,
    tourOperatorId: string,
  ): Promise<HotelDetail> {
    return this.prisma.hotel.create({
      data: { ...data, tourOperatorId },
      include: HOTEL_INCLUDE,
    });
  }

  async findAll(
    tourOperatorId: string,
    query: HotelQuery,
  ): Promise<PaginatedResult<HotelDetail>> {
    const { search, limit = 50, offset = 0 } = query;

    const where: Prisma.HotelWhereInput = {
      tourOperatorId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { destination: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.hotel.findMany({
        where,
        include: HOTEL_INCLUDE,
        take: limit,
        skip: offset,
      }),
      this.prisma.hotel.count({ where }),
    ]);

    return { data, total, limit, offset };
  }

  async findById(id: string): Promise<HotelDetail | null> {
    return this.prisma.hotel.findUnique({
      where: { id },
      include: HOTEL_INCLUDE,
    });
  }

  async update(
    id: string,
    tourOperatorId: string,
    data: UpdateHotelDto,
  ): Promise<HotelDetail | null> {
    try {
      return await this.prisma.hotel.update({
        where: { id, tourOperatorId },
        data,
        include: HOTEL_INCLUDE,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return null;
      }
      throw error;
    }
  }

  async delete(id: string, tourOperatorId: string): Promise<RepositoryResult> {
    try {
      await this.prisma.hotel.delete({ where: { id, tourOperatorId } });
      return RepositoryResult.DELETED;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') return RepositoryResult.NOT_FOUND;
        if (error.code === 'P2003') return RepositoryResult.HAS_CONTRACTS;
      }
      throw error;
    }
  }

  async findAllAgeCategories(hotelId: string): Promise<AgeCategory[]> {
    return this.prisma.ageCategory.findMany({
      where: { hotelId },
      orderBy: { minAge: 'asc' },
    });
  }

  async createAgeCategory(
    hotelId: string,
    data: CreateAgeCategoryDto,
  ): Promise<AgeCategory> {
    return this.prisma.ageCategory.create({
      data: { ...data, hotelId },
    });
  }

  async updateAgeCategory(
    id: string,
    data: UpdateAgeCategoryDto,
  ): Promise<AgeCategory> {
    return this.prisma.ageCategory.update({
      where: { id },
      data: { ...data },
    });
  }

  async findAgeCategoryById(id: string): Promise<AgeCategory | null> {
    return this.prisma.ageCategory.findUnique({ where: { id } });
  }

  async findOverlappingAgeCategory(
    hotelId: string,
    minAge: number,
    maxAge: number,
    excludeId?: string,
  ): Promise<AgeCategory | null> {
    return this.prisma.ageCategory.findFirst({
      where: {
        hotelId,
        ...(excludeId && { id: { not: excludeId } }),
        AND: [{ minAge: { lt: maxAge } }, { maxAge: { gt: minAge } }],
      },
    });
  }

  async deleteAgeCategory(id: string): Promise<RepositoryResult> {
    try {
      await this.prisma.ageCategory.delete({ where: { id } });
      return RepositoryResult.DELETED;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') return RepositoryResult.NOT_FOUND;
        if (error.code === 'P2003') return RepositoryResult.HAS_CONTRACTS;
      }
      throw error;
    }
  }

  async findAllRoomTypes(hotelId: string): Promise<RoomType[]> {
    return this.prisma.roomType.findMany({ where: { hotelId } });
  }

  async findRoomTypeByCode(
    hotelId: string,
    code: string,
    excludeId?: string,
  ): Promise<RoomType | null> {
    return this.prisma.roomType.findFirst({
      where: {
        hotelId,
        code,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
  }

  async findRoomTypeById(id: string): Promise<RoomType | null> {
    return this.prisma.roomType.findUnique({ where: { id } });
  }

  async createRoomType(
    hotelId: string,
    data: CreateRoomTypeDto,
  ): Promise<RoomType> {
    return this.prisma.roomType.create({
      data: { ...data, hotelId },
    });
  }

  async updateRoomType(id: string, data: UpdateRoomTypeDto): Promise<RoomType> {
    return this.prisma.roomType.update({
      where: { id },
      data: { ...data },
    });
  }

  async deleteRoomType(id: string): Promise<RepositoryResult> {
    try {
      await this.prisma.roomType.delete({
        where: { id },
      });
      return RepositoryResult.DELETED;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') return RepositoryResult.NOT_FOUND;
        if (error.code === 'P2003') return RepositoryResult.HAS_CONTRACTS;
      }
      throw error;
    }
  }

  async createRoomTypeCapacity(
    roomTypeId: string,
    dto: CreateRoomTypeCapacityDto,
  ): Promise<RoomTypeCapacity | RepositoryResult> {
    try {
      return await this.prisma.roomTypeCapacity.create({
        data: { ...dto, roomTypeId },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') return RepositoryResult.CONFLICT;
      }
      throw error;
    }
  }

  async findRoomTypeCapacityById(id: string): Promise<RoomTypeCapacity | null> {
    return this.prisma.roomTypeCapacity.findUnique({ where: { id } });
  }

  async updateRoomTypeCapacity(
    id: string,
    dto: UpdateRoomTypeCapacityDto,
  ): Promise<RoomTypeCapacity> {
    return this.prisma.roomTypeCapacity.update({
      where: { id },
      data: { ...dto },
    });
  }

  async deleteRoomTypeCapacity(id: string): Promise<RepositoryResult> {
    try {
      await this.prisma.roomTypeCapacity.delete({ where: { id } });
      return RepositoryResult.DELETED;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') return RepositoryResult.NOT_FOUND;
        if (error.code === 'P2003') return RepositoryResult.HAS_CONTRACTS;
      }
      throw error;
    }
  }
}
