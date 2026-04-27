import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHotelDto } from '../dto/create-hotel.dto';
import { UpdateHotelDto } from '../dto/update-hotel.dto';
import { IHotelRepository } from '../hotels.repository.interface';
import { HotelDetail, HotelQuery, PaginatedResult } from '../hotels.types';

const HOTEL_INCLUDE = {
  ageCategories: true,
  roomTypes: true,
} satisfies Prisma.HotelInclude;

@Injectable()
export class PrismaHotelRepository implements IHotelRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateHotelDto,
    tourOperatorId: string,
  ): Promise<HotelDetail> {
    return this.prisma.hotel.create({
      data: {
        ...data,
        tourOperatorId,
      },
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
        include: { ageCategories: true, roomTypes: true },
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
        include: {
          ageCategories: true,
          roomTypes: true,
        },
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
}
