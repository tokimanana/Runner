import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HotelsService {
  constructor(private prisma: PrismaService) {}

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

    if (!hotel) throw new NotFoundException(`Hotel ${id} not found`);

    if (hotel.tourOperatorId !== tourOperatorId) {
      throw new NotFoundException(`Hotel ${id} not found`);
    }

    return hotel;
  }
}
