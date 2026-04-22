import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';

@Injectable()
export class HotelsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateHotelDto, tourOperatorId: string) {
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
  ) {
    const { search, limit = 50, offset = 0 } = query;

    return this.prisma.hotel.findMany({
      where: {
        tourOperatorId,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { destination: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        ageCategories: true,
        roomTypes: true,
      },
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string, tourOperatorId: string) {
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

  async update(id: string, dto: UpdateHotelDto, tourOperatorId: string) {
    try {
      return await this.prisma.hotel.update({
        where: { id, tourOperatorId },
        data: dto,
        include: {
          ageCategories: true,
          roomTypes: true,
        },
      });
    } catch {
      throw new NotFoundException(`Hotel ${id} not found`);
    }
  }

  async remove(id: string, tourOperatorId: string): Promise<void> {
    try {
      await this.prisma.hotel.delete({
        where: { id, tourOperatorId },
      });
    } catch {
      throw new NotFoundException(`Hotel ${id} not found`);
    }
  }
}
