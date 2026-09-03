import { PrismaService } from '@backend/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

import { PaginationQuery } from '@backend/common/pagination.types';
import {
  RepositoryException,
  RepositoryResult,
} from '@backend/common/repository.types';
import { Prisma, Season } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PaginatedResult } from '@runner/shared/types';
import { CreateSeasonDto } from '../dto/create-season.dto';
import { UpdateSeasonDto } from '../dto/update-season.dto';
import { SeasonRepository, SeasonWithPeriods } from './season.repository';

@Injectable()
export class PrismaSeasonRepository extends SeasonRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    tourOperatorId: string,
    query?: PaginationQuery,
  ): Promise<PaginatedResult<SeasonWithPeriods>> {
    const { limit, offset } = query ?? {};

    const where: Prisma.SeasonWhereInput = {
      tourOperatorId,
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.season.findMany({
        where,
        take: limit,
        skip: offset,
        include: { seasonPeriods: true },
      }),
      this.prisma.season.count({ where }),
    ]);

    return { data, total, limit, offset };
  }

  async findOne(
    id: string,
    tourOperatorId: string,
  ): Promise<SeasonWithPeriods | null> {
    return this.prisma.season.findUnique({
      where: { id, tourOperatorId },
      include: { seasonPeriods: true },
    });
  }

  async create(dto: CreateSeasonDto, tourOperatorId: string): Promise<Season> {
    try {
      return await this.prisma.season.create({
        data: { ...dto, tourOperatorId },
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
    dto: UpdateSeasonDto,
    tourOperatorId: string,
  ): Promise<Season> {
    try {
      return await this.prisma.season.update({
        where: { id, tourOperatorId },
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

  async remove(id: string, tourOperatorId: string): Promise<RepositoryResult> {
    try {
      await this.prisma.season.delete({
        where: { id, tourOperatorId },
      });
      return RepositoryResult.DELETED;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') return RepositoryResult.NOT_FOUND;
        if (error.code === 'P2003') return RepositoryResult.HAS_PERIODS;
      }
      throw error;
    }
  }
}
