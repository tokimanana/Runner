import {
  RepositoryException,
  RepositoryResult,
} from '@backend/common/repository.types';
import { serializeDates } from '@backend/common/serialize-dates.util';
import { PrismaService } from '@backend/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  AgePolicy,
  BaseRate,
  ContractPeriod,
  MealPlanSupplement,
  OccupancyGuidance,
  Prisma,
  RoomPrice,
  SeasonPeriod,
  StopSalesDate,
} from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  PaginatedResult,
  Contract as SharedContract,
} from '@runner/shared/types';
import {
  AgePolicyCreateData,
  AgePolicyUpdateData,
  BaseRateCreateData,
  BaseRateUpdateData,
  ContractPeriodCreateData,
  ContractPeriodUpdateData,
  ContractQuery,
  MealPlanSupplementCreateData,
  MealPlanSupplementUpdateData,
  OccupancyGuidanceCreateData,
  OccupancyGuidanceUpdateData,
  OccupancyRateCreateData,
  RoomPriceCreateData,
  RoomPriceUpdateData,
  StopSalesDateCreateData,
} from '../contracts.types';
import { CreateContractDto } from '../dto/create-contract.dto';
import { UpdateContractDto } from '../dto/update-contract.dto';
import {
  ContractRepository,
  RoomTypeWithCapacities,
} from './contract.repository';

const CONTRACT_INCLUDE = {
  hotel: { select: { id: true, name: true } },
  market: { select: { id: true, name: true } },
  currency: { select: { id: true, code: true, symbol: true } },
  _count: { select: { periods: true } },
} satisfies Prisma.ContractInclude;

@Injectable()
export class PrismaContractRepository extends ContractRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    tourOperatorId: string,
    query?: ContractQuery,
  ): Promise<PaginatedResult<SharedContract>> {
    const { limit, offset, hotelId, marketId } = query ?? {};

    const where: Prisma.ContractWhereInput = {
      tourOperatorId,
      hotelId,
      marketId,
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.contract.findMany({
        where,
        include: CONTRACT_INCLUDE,
        take: limit,
        skip: offset,
      }),
      this.prisma.contract.count({ where }),
    ]);

    const mappedData = data.map((contract) => this.mapToContract(contract));

    return {
      data: serializeDates(mappedData),
      total,
      limit,
      offset,
    };
  }

  async findOne(
    id: string,
    tourOperatorId: string,
  ): Promise<SharedContract | null> {
    const contract = await this.prisma.contract.findUnique({
      where: { id, tourOperatorId },
      include: {
        ...CONTRACT_INCLUDE,
        periods: {
          include: {
            seasonPeriod: true,
            baseMealPlan: true,
            roomPrices: {
              include: {
                occupancyRates: true, // legacy
              },
            },
            mealPlanSupplements: true,
            stopSalesDates: true,
            baseRates: {
              include: {
                roomType: { select: { id: true, name: true, code: true } },
              },
            },
            agePolicies: {
              include: {
                roomType: { select: { id: true, name: true, code: true } },
                ageCategory: true,
              },
            },
          },
        },
      },
    });

    if (!contract) {
      return null;
    }

    return serializeDates(this.mapToContract(contract));
  }

  async create(
    dto: CreateContractDto,
    tourOperatorId: string,
  ): Promise<SharedContract> {
    try {
      const createdContract = await this.prisma.contract.create({
        data: { ...dto, tourOperatorId },
        include: CONTRACT_INCLUDE,
      });
      return serializeDates(this.mapToContract(createdContract));
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
  ): Promise<SharedContract> {
    try {
      const updatedContract = await this.prisma.contract.update({
        where: { id, tourOperatorId },
        include: CONTRACT_INCLUDE,
        data: dto,
      });
      return serializeDates(this.mapToContract(updatedContract));
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
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new RepositoryException(RepositoryResult.CONFLICT);

        if (error.code === 'P2003')
          throw new RepositoryException(RepositoryResult.NOT_FOUND);
      }
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
    data: ContractPeriodUpdateData,
    contractId: string,
  ): Promise<ContractPeriod> {
    try {
      return await this.prisma.contractPeriod.update({
        where: { id: periodId, contractId },
        data,
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
    occupancyRates?: OccupancyRateCreateData[],
  ): Promise<RoomPrice> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const roomPrice = await tx.roomPrice.create({
          data: { ...dto, contractPeriodId },
        });

        if (occupancyRates?.length) {
          await tx.occupancyRate.createMany({
            data: occupancyRates.map((rate) => ({
              ...rate,
              roomPriceId: roomPrice.id,
            })),
          });
        }

        return tx.roomPrice.findUniqueOrThrow({
          where: { id: roomPrice.id },
          include: { occupancyRates: true },
        });
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

  async findRoomTypeWithCapacities(
    roomTypeId: string,
  ): Promise<RoomTypeWithCapacities | null> {
    return this.prisma.roomType.findUnique({
      where: { id: roomTypeId },
      include: { capacities: true },
    });
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
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new RepositoryException(RepositoryResult.CONFLICT);
        if (error.code === 'P2003')
          throw new RepositoryException(RepositoryResult.NOT_FOUND);
      }
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

  async createMealPlanSupplement(
    data: MealPlanSupplementCreateData,
    contractPeriodId: string,
  ): Promise<MealPlanSupplement> {
    try {
      return await this.prisma.mealPlanSupplement.create({
        data: { ...data, contractPeriodId },
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

  async updateMealPlanSupplement(
    id: string,
    data: MealPlanSupplementUpdateData,
  ): Promise<MealPlanSupplement> {
    try {
      return await this.prisma.mealPlanSupplement.update({
        where: { id },
        data,
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

  async removeMealPlanSupplement(id: string): Promise<RepositoryResult> {
    try {
      await this.prisma.mealPlanSupplement.delete({
        where: { id },
      });
      return RepositoryResult.DELETED;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') return RepositoryResult.NOT_FOUND;
      }
      throw error;
    }
  }

  async createStopSalesDate(
    data: StopSalesDateCreateData,
    contractPeriodId: string,
  ): Promise<StopSalesDate> {
    try {
      return await this.prisma.stopSalesDate.create({
        data: {
          date: data.date,
          contractPeriodId,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new RepositoryException(RepositoryResult.CONFLICT);
      }
      throw error;
    }
  }

  async removeStopSalesDate(id: string): Promise<RepositoryResult> {
    try {
      await this.prisma.stopSalesDate.delete({
        where: { id },
      });
      return RepositoryResult.DELETED;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') return RepositoryResult.NOT_FOUND;
      }
      throw error;
    }
  }

  // ─── BaseRate ────────────────────────────────────────────────

  async createBaseRate(
    data: BaseRateCreateData,
    contractPeriodId: string,
  ): Promise<BaseRate> {
    try {
      return await this.prisma.baseRate.create({
        data: { ...data, contractPeriodId },
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

  async findBaseRatesByPeriod(contractPeriodId: string): Promise<BaseRate[]> {
    return this.prisma.baseRate.findMany({
      where: { contractPeriodId },
    });
  }

  async updateBaseRate(
    id: string,
    data: BaseRateUpdateData,
  ): Promise<BaseRate> {
    try {
      return await this.prisma.baseRate.update({
        where: { id },
        data,
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

  async removeBaseRate(id: string): Promise<RepositoryResult> {
    try {
      await this.prisma.baseRate.delete({ where: { id } });
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

  // ─── AgePolicy ───────────────────────────────────────────────

  async createAgePolicy(
    data: AgePolicyCreateData,
    contractPeriodId: string,
  ): Promise<AgePolicy> {
    try {
      return await this.prisma.agePolicy.create({
        data: { ...data, contractPeriodId },
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

  async findAgePoliciesByPeriod(
    contractPeriodId: string,
  ): Promise<AgePolicy[]> {
    return this.prisma.agePolicy.findMany({
      where: { contractPeriodId },
    });
  }

  async updateAgePolicy(
    id: string,
    data: AgePolicyUpdateData,
  ): Promise<AgePolicy> {
    try {
      return await this.prisma.agePolicy.update({
        where: { id },
        data,
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

  async removeAgePolicy(id: string): Promise<RepositoryResult> {
    try {
      await this.prisma.agePolicy.delete({ where: { id } });
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

  // ─── OccupancyGuidance ───────────────────────────────────────

  async createOccupancyGuidance(
    data: OccupancyGuidanceCreateData,
  ): Promise<OccupancyGuidance> {
    try {
      return await this.prisma.occupancyGuidance.create({ data });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2003')
          throw new RepositoryException(RepositoryResult.NOT_FOUND);
      }
      throw error;
    }
  }

  async findOccupancyGuidanceByRoomType(
    roomTypeId: string,
  ): Promise<OccupancyGuidance[]> {
    return this.prisma.occupancyGuidance.findMany({
      where: { roomTypeId },
    });
  }

  async updateOccupancyGuidance(
    id: string,
    data: OccupancyGuidanceUpdateData,
  ): Promise<OccupancyGuidance> {
    try {
      return await this.prisma.occupancyGuidance.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2003')
          throw new RepositoryException(RepositoryResult.NOT_FOUND);
      }
      throw error;
    }
  }

  async removeOccupancyGuidance(id: string): Promise<RepositoryResult> {
    try {
      await this.prisma.occupancyGuidance.delete({ where: { id } });
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

  private mapToContract<
    T extends Prisma.ContractGetPayload<{ include: typeof CONTRACT_INCLUDE }>,
  >(
    contract: T,
  ): Omit<SharedContract, 'createdAt' | 'updatedAt'> & {
    createdAt: Date;
    updatedAt: Date;
  } {
    const { _count, ...rest } = contract;
    return {
      ...rest,
      periodsCount: _count.periods,
    };
  }
}
