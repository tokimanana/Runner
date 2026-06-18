import {
  RepositoryException,
  RepositoryResult,
} from '@backend/common/repository.types';
import { PrismaService } from '@backend/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  Contract,
  ContractPeriod,
  Prisma,
  RoomPrice,
  SeasonPeriod,
} from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PaginatedResult } from '@runner/shared/types';
import {
  ContractPeriodCreateData,
  ContractQuery,
  RoomPriceCreateData,
  RoomPriceUpdateData,
} from '../contracts.types';
import { CreateContractDto } from '../dto/create-contract.dto';
import { UpdateContractPeriodDto } from '../dto/update-contract-period.dto';
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

  async createPeriod(
    data: ContractPeriodCreateData,
    contractId: string,
  ): Promise<ContractPeriod> {
    try {
      return await this.prisma.contractPeriod.create({
        data: { ...data, contractId },
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

  async findSeasonPeriod(seasonPeriodId: string): Promise<SeasonPeriod | null> {
    return this.prisma.seasonPeriod.findUnique({
      where: { id: seasonPeriodId },
    });
  }

  async findContractPeriod(
    periodId: string,
    contractId: string,
  ): Promise<ContractPeriod | null> {
    return this.prisma.contractPeriod.findUnique({
      where: { id: periodId, contractId },
    });
  }

  async updatePeriod(
    periodId: string,
    dto: UpdateContractPeriodDto,
    contractId: string,
  ): Promise<ContractPeriod> {
    try {
      return await this.prisma.contractPeriod.update({
        where: { id: periodId, contractId },
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

  async removePeriod(
    periodId: string,
    contractId: string,
  ): Promise<RepositoryResult> {
    try {
      await this.prisma.contractPeriod.delete({
        where: { id: periodId, contractId },
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

  async validateNoOverlap(
    contractId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string,
  ): Promise<ContractPeriod | null> {
    return await this.prisma.contractPeriod.findFirst({
      where: {
        contractId,
        id: excludeId ? { not: excludeId } : undefined,
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });
  }

  async createRoomPrice(
    dto: RoomPriceCreateData,
    contractPeriodId: string,
  ): Promise<RoomPrice> {
    try {
      return await this.prisma.roomPrice.create({
        data: { ...dto, contractPeriodId },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new RepositoryException(RepositoryResult.CONFLICT);
        if (error.code === 'P2003')
          throw new RepositoryException(RepositoryResult.NOT_FOUND);
      }
      throw error;
    }
  }

  async updateRoomPrice(
    id: string,
    dto: RoomPriceUpdateData,
  ): Promise<RoomPrice> {
    try {
      return await this.prisma.roomPrice.update({
        where: { id },
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

  async removeRoomPrice(id: string): Promise<RepositoryResult> {
    try {
      await this.prisma.roomPrice.delete({ where: { id } });
      return RepositoryResult.DELETED;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        return RepositoryResult.NOT_FOUND;
      throw error;
    }
  }
}
