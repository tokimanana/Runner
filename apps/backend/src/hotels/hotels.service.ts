import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
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
}
