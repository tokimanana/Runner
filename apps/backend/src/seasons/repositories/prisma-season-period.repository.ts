import { PrismaService } from '@backend/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

import { PaginationQuery } from '@backend/common/pagination.types';
import {
  RepositoryException,
  RepositoryResult,
} from '@backend/common/repository.types';
import { Prisma, SeasonPeriod } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PaginatedResult } from '@runner/shared/types';
import { CreateSeasonPeriodDto } from '../dto/create-season-period.dto';
import { UpdateSeasonPeriodDto } from '../dto/update-season-period.dto';
import { SeasonPeriodRepository } from './season-period.repository';

@Injectable()
export class PrismaSeasonPeriodRepository extends SeasonPeriodRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    seasonId: string,
    query?: PaginationQuery,
  ): Promise<PaginatedResult<SeasonPeriod>> {
    const { limit, offset } = query ?? {};

    const where: Prisma.SeasonPeriodWhereInput = {
      seasonId,
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.seasonPeriod.findMany({ where, take: limit, skip: offset }),
      this.prisma.seasonPeriod.count({ where }),
    ]);

    return { data, total, limit, offset };
  }

  async findOne(id: string, seasonId: string): Promise<SeasonPeriod | null> {
    return this.prisma.seasonPeriod.findUnique({
      where: { id, seasonId },
    });
  }

  async create(
    dto: CreateSeasonPeriodDto,
    seasonId: string,
  ): Promise<SeasonPeriod> {
    try {
      return await this.prisma.seasonPeriod.create({
        data: { ...dto, seasonId },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      )
        throw new RepositoryException(RepositoryResult.CONFLICT);
      throw error;
    }
  }

  async update(
    id: string,
    dto: UpdateSeasonPeriodDto,
    seasonId: string,
  ): Promise<SeasonPeriod> {
    try {
      return await this.prisma.seasonPeriod.update({
        where: { id, seasonId },
        data: dto,
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      )
        throw new RepositoryException(RepositoryResult.CONFLICT);
      throw error;
    }
  }

  async remove(id: string, seasonId: string): Promise<RepositoryResult> {
    try {
      await this.prisma.seasonPeriod.delete({
        where: { id, seasonId },
      });
      return RepositoryResult.DELETED;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') return RepositoryResult.NOT_FOUND;
      }
      throw error;
    }
  }
}
