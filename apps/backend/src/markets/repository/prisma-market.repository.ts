import {
  RepositoryException,
  RepositoryResult,
} from '@backend/common/repository.types';
import { PrismaService } from '@backend/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Market, Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PaginatedResult } from '@runner/shared/types';
import { CreateMarketDto } from '../dto/create-market.dto';
import { UpdateMarketDto } from '../dto/update-market.dto';
import { MarketQuery } from '../market.types';
import { MarketRepository } from './market.repository';

@Injectable()
export class PrismaMarketRepository extends MarketRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    tourOperatorId: string,
    query?: MarketQuery,
  ): Promise<PaginatedResult<Market>> {
    const { limit, offset } = query ?? {};

    const where = { tourOperatorId };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.market.findMany({
        where,
        take: limit,
        skip: offset,
      }),
      this.prisma.market.count({ where }),
    ]);
    return { data, total, limit, offset };
  }

  async findOne(id: string, tourOperatorId: string): Promise<Market | null> {
    return this.prisma.market.findUnique({
      where: { id, tourOperatorId },
    });
  }

  async create(dto: CreateMarketDto, tourOperatorId: string): Promise<Market> {
    try {
      return await this.prisma.market.create({
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
    dto: UpdateMarketDto,
    tourOperatorId: string,
  ): Promise<Market> {
    try {
      return await this.prisma.market.update({
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
      await this.prisma.market.delete({
        where: { id, tourOperatorId },
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
}
