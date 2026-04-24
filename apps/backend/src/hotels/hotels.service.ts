import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AgeCategory, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgeCategoryDto } from './dto/create-age-category.dto';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateAgeCategoryDto } from './dto/update-age-category.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';

type HotelDetail = Prisma.HotelGetPayload<{
  include: { ageCategories: true; roomTypes: true };
}>;

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
    query: { search?: string; limit?: number; offset?: number },
  ): Promise<{
    data: HotelDetail[];
    total: number;
    limit: number;
    offset: number;
  }> {
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

    if (dto.maxAge <= dto.minAge) {
      throw new BadRequestException('maxAge must be greater than minAge');
    }

    const overlapping = await this.prisma.ageCategory.findFirst({
      where: {
        hotelId,
        AND: [{ minAge: { lt: dto.maxAge } }, { maxAge: { gt: dto.minAge } }],
      },
    });

    if (overlapping) {
      throw new BadRequestException('Ages must not overlap');
    }

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

    if (maxAge <= minAge) {
      throw new BadRequestException('maxAge must be greater than minAge');
    }

    const overlapping = await this.prisma.ageCategory.findFirst({
      where: {
        hotelId,
        id: { not: id },
        AND: [{ minAge: { lt: maxAge } }, { maxAge: { gt: minAge } }],
      },
    });

    if (overlapping) {
      throw new BadRequestException('Ages must not overlap');
    }

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
}
