import {
  RepositoryException,
  RepositoryResult,
} from '@backend/common/repository.types';
import { PrismaService } from '@backend/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, Supplement } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PaginatedResult } from '@runner/shared/types';
import { CreateSupplementDto } from '../dto/create-supplement.dto';
import { UpdateSupplementDto } from '../dto/update-supplement.dto';
import { SupplementQuery } from '../supplements.types';
import { SupplementRepository } from './supplement.repository';

@Injectable()
export class PrismaSupplementRepository extends SupplementRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    tourOperatorId: string,
    query?: SupplementQuery,
  ): Promise<PaginatedResult<Supplement>> {
    const { limit, offset, unit } = query ?? {};

    const where: Prisma.SupplementWhereInput = {
      tourOperatorId,
      ...(query?.unit && { unit }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.supplement.findMany({ where, take: limit, skip: offset }),
      this.prisma.supplement.count({ where }),
    ]);

    return { data, total, limit, offset };
  }

  async findOne(
    id: string,
    tourOperatorId: string,
  ): Promise<Supplement | null> {
    return this.prisma.supplement.findUnique({
      where: { id, tourOperatorId },
    });
  }

  async create(
    dto: CreateSupplementDto,
    tourOperatorId: string,
  ): Promise<Supplement> {
    try {
      return await this.prisma.supplement.create({
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
    dto: UpdateSupplementDto,
    tourOperatorId: string,
  ): Promise<Supplement> {
    try {
      return await this.prisma.supplement.update({
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
      await this.prisma.supplement.delete({
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
