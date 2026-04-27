import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AgeCategory, Prisma, RoomType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgeCategoryDto } from './dto/create-age-category.dto';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateAgeCategoryDto } from './dto/update-age-category.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';
import { HotelDetail, HotelQuery, PaginatedResult } from './hotels.types';

@Injectable()
export class HotelsService {
  constructor(private prisma: PrismaService) {}

  async create(
    dto: CreateHotelDto,
    tourOperatorId: string,
  ): Promise<HotelDetail> {
    return this.prisma.hotel.create({
      data: {
        ...dto,
        tourOperatorId,
      },
      include: {
        ageCategories: true,
        roomTypes: true,
      },
    });
  }

  async findAll(
    tourOperatorId: string,
    query: HotelQuery,
  ): Promise<PaginatedResult<HotelDetail>> {
    const MAX_LIMIT = 100;
    const { search, limit = 50, offset = 0 } = query;
    const sanitizedLimit = Math.min(limit, MAX_LIMIT);

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
        include: { ageCategories: true, roomTypes: true },
        take: sanitizedLimit,
        skip: offset,
      }),
      this.prisma.hotel.count({ where }),
    ]);

    return { data, total, limit: sanitizedLimit, offset };
  }

  async findOne(id: string, tourOperatorId: string): Promise<HotelDetail> {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id },
      include: {
        ageCategories: true,
        roomTypes: true,
      },
    });

    if (!hotel || hotel.tourOperatorId !== tourOperatorId) {
      throw new NotFoundException(`Hotel ${id} not found`);
    }

    return hotel;
  }

  async update(
    id: string,
    dto: UpdateHotelDto,
    tourOperatorId: string,
  ): Promise<HotelDetail> {
    try {
      return await this.prisma.hotel.update({
        where: { id, tourOperatorId },
        data: dto,
        include: {
          ageCategories: true,
          roomTypes: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Hotel ${id} not found`);
        }
      }
      throw error;
    }
  }

  async remove(id: string, tourOperatorId: string): Promise<void> {
    try {
      await this.prisma.hotel.delete({ where: { id, tourOperatorId } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Hotel ${id} not found`);
        }
        if (error.code === 'P2003') {
          throw new ConflictException(`Hotel ${id} has linked contracts`);
        }
      }
      throw error;
    }
  }

  async findAllAgeCategories(
    tourOperatorId: string,
    hotelId: string,
  ): Promise<AgeCategory[]> {
    await this.findOne(hotelId, tourOperatorId);

    return this.prisma.ageCategory.findMany({
      where: { hotelId },
      orderBy: { order: 'asc' },
    });
  }

  async createAgeCategory(
    dto: CreateAgeCategoryDto,
    tourOperatorId: string,
    hotelId: string,
  ): Promise<AgeCategory> {
    await this.findOne(hotelId, tourOperatorId);

    await this.validateAgeCategoryOverlap(hotelId, dto.minAge, dto.maxAge);

    return this.prisma.ageCategory.create({
      data: {
        ...dto,
        hotelId,
      },
    });
  }

  async updateAgeCategory(
    id: string,
    dto: UpdateAgeCategoryDto,
    tourOperatorId: string,
    hotelId: string,
  ): Promise<AgeCategory> {
    await this.findOne(hotelId, tourOperatorId);

    const existing = await this.prisma.ageCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Age category ${id} not found`);
    }

    const minAge = dto.minAge ?? existing.minAge;
    const maxAge = dto.maxAge ?? existing.maxAge;

    await this.validateAgeCategoryOverlap(hotelId, minAge, maxAge, id);

    return this.prisma.ageCategory.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async removeAgeCategory(
    id: string,
    tourOperatorId: string,
    hotelId: string,
  ): Promise<void> {
    await this.findOne(hotelId, tourOperatorId);

    try {
      await this.prisma.ageCategory.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Age Category ${id} not found`);
        }
      }
      throw error;
    }
  }

  private async validateAgeCategoryOverlap(
    hotelId: string,
    minAge: number,
    maxAge: number,
    excludedId?: string,
  ): Promise<void> {
    if (maxAge <= minAge) {
      throw new BadRequestException('maxAge must be greater than minAge');
    }

    const overlapping = await this.prisma.ageCategory.findFirst({
      where: {
        hotelId,
        ...(excludedId && { id: { not: excludedId } }),
        AND: [{ minAge: { lt: maxAge } }, { maxAge: { gt: minAge } }],
      },
    });

    if (overlapping) {
      throw new BadRequestException('Ages must not overlap');
    }
  }

  async findAllRoomTypes(
    tourOperatorId: string,
    hotelId: string,
  ): Promise<RoomType[]> {
    await this.findOne(hotelId, tourOperatorId);

    return this.prisma.roomType.findMany({
      where: { hotelId },
    });
  }

  async createRoomType(
    dto: CreateRoomTypeDto,
    tourOperatorId: string,
    hotelId: string,
  ): Promise<RoomType> {
    await this.findOne(hotelId, tourOperatorId);

    await this.validateRoomTypeCode(hotelId, dto.code);

    return this.prisma.roomType.create({
      data: {
        ...dto,
        hotelId,
      },
    });
  }

  async updateRoomType(
    id: string,
    dto: UpdateRoomTypeDto,
    tourOperatorId: string,
    hotelId: string,
  ): Promise<RoomType> {
    await this.findOne(hotelId, tourOperatorId);

    const existing = await this.prisma.roomType.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Room type ${id} not found`);
    }

    const adults = dto.maxAdults ?? existing.maxAdults;
    const children = dto.maxChildren ?? existing.maxChildren;
    if (adults + children < 1) {
      throw new BadRequestException(
        'maxAdults + maxChildren must be at least 1',
      );
    }

    if (dto.code) {
      await this.validateRoomTypeCode(hotelId, dto.code, id);
    }

    return this.prisma.roomType.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async removeRoomType(
    id: string,
    tourOperatorId: string,
    hotelId: string,
  ): Promise<void> {
    await this.findOne(hotelId, tourOperatorId);

    try {
      await this.prisma.roomType.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Room type ${id} not found`);
        }
        if (error.code === 'P2003') {
          throw new ConflictException(`Room type ${id} has linked contracts`);
        }
      }
      throw error;
    }
  }

  private async validateRoomTypeCode(
    hotelId: string,
    code: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.prisma.roomType.findFirst({
      where: {
        hotelId,
        code,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    if (existing) {
      throw new ConflictException(
        `Room type code "${code}" already exists in this hotel`,
      );
    }
  }
}
