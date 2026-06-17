import {
  RepositoryException,
  RepositoryResult,
} from '@backend/common/repository.types';
import { PrismaService } from '@backend/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Contract, Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PaginatedResult } from '@runner/shared/types';
import { ContractQuery } from '../contracts.types';
import { CreateContractDto } from '../dto/create-contract.dto';
import { UpdateContractDto } from '../dto/update-contract.dto';
import { ContractRepository } from './contract.repository';

@Injectable()
export class PrismaContractRepository extends ContractRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    tourOperatorId: string,
    query?: ContractQuery,
  ): Promise<PaginatedResult<Contract>> {
    const { limit, offset, hotelId, marketId } = query ?? {};

    const where: Prisma.ContractWhereInput = {
      tourOperatorId,
      hotelId,
      marketId,
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.contract.findMany({ where, take: limit, skip: offset }),
      this.prisma.contract.count({ where }),
    ]);

    return { data, total, limit, offset };
  }

  async findOne(id: string, tourOperatorId: string): Promise<Contract | null> {
    return this.prisma.contract.findUnique({
      where: { id, tourOperatorId },
      include: {
        periods: {
          include: {
            seasonPeriod: true,
            baseMealPlan: true,
            roomPrices: {
              include: {
                occupancyRates: true,
              },
            },
            mealPlanSupplements: true,
            stopSalesDates: true,
          },
        },
      },
    });
  }

  async create(
    dto: CreateContractDto,
    tourOperatorId: string,
  ): Promise<Contract> {
    try {
      return await this.prisma.contract.create({
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
    dto: UpdateContractDto,
    tourOperatorId: string,
  ): Promise<Contract> {
    try {
      return await this.prisma.contract.update({
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
      await this.prisma.contract.delete({
        where: { id, tourOperatorId },
      });
      return RepositoryResult.DELETED;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') return RepositoryResult.NOT_FOUND;
        if (error.code === 'P2003') return RepositoryResult.HAS_RELATIONS;
      }
      throw error;
    }
  }
}
