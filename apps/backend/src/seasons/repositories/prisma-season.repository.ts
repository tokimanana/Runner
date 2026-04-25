import { PrismaService } from '@backend/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

import { Prisma, Season } from '@prisma/client';
import { CreateSeasonDto } from '../dto/create-season.dto';
import { UpdateSeasonDto } from '../dto/update-season.dto';
import { SeasonRepository } from './season.repository';

@Injectable()
export class PrismaSeasonRepository extends SeasonRepository {
  constructor(private prisma: PrismaService) {
    super();
  }

  async findAll(
    tourOperatorId: string,
    query?: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    },
  ): Promise<{
    data: Season[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit, offset } = query ?? {};

    const where: Prisma.SeasonWhereInput = {
      tourOperatorId,
      ...(query?.startDate && { startDate: { gte: query.startDate } }),
      ...(query?.endDate && { endDate: { lte: query?.endDate } }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.season.findMany({ where, take: limit, skip: offset }),
      this.prisma.season.count({ where }),
    ]);

    return { data, total, limit, offset };
  }

  async findOne(id: string, tourOperatorId: string): Promise<Season | null> {
    return this.prisma.season.findUnique({
      where: { id, tourOperatorId },
    });
  }

  async create(dto: CreateSeasonDto, tourOperatorId: string): Promise<Season> {
    return this.prisma.season.create({
      data: {
        ...dto,
        tourOperatorId,
      },
    });
  }

  async update(
    id: string,
    dto: UpdateSeasonDto,
    tourOperatorId: string,
  ): Promise<Season> {
    return this.prisma.season.update({
      where: { id, tourOperatorId },
      data: dto,
    });
  }

  async remove(id: string, tourOperatorId: string): Promise<void> {
    await this.prisma.season.delete({
      where: { id, tourOperatorId },
    });
  }
}
