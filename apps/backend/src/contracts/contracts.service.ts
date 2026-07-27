import {
  DEFAULT_PAGINATION_LIMIT,
  MAX_PAGINATION_LIMIT,
} from '@backend/common/pagination.constants';
import {
  RepositoryException,
  RepositoryResult,
} from '@backend/common/repository.types';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ContractPeriod,
  MealPlanSupplement,
  RoomPrice,
  StopSalesDate,
} from '@prisma/client';
import {
  OccupancyRateDto,
  PaginatedResult,
  Contract as SharedContract,
} from '@runner/shared/types';
import { ContractQuery, OccupancyRateCreateData } from './contracts.types';
import { CreateContractPeriodDto } from './dto/create-contract-period.dto';
import { CreateContractDto } from './dto/create-contract.dto';
import { CreateMealPlanSupplementDto } from './dto/create-meal-plan-supplement.dto';
import { CreateRoomPriceDto } from './dto/create-room-price.dto';
import { CreateStopSalesDateDto } from './dto/create-stop-sales-date.dto';
import { UpdateContractPeriodDto } from './dto/update-contract-period.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { UpdateMealPlanSupplementDto } from './dto/update-meal-plan-supplement.dto';
import { UpdateRoomPriceDto } from './dto/update-room-price.dto';
import { ContractRepository } from './repositories/contract.repository';

@Injectable()
export class ContractsService {
  constructor(private readonly contractRepository: ContractRepository) {}

  async create(
    dto: CreateContractDto,
    tourOperatorId: string,
  ): Promise<SharedContract> {
    return this.contractRepository.create(dto, tourOperatorId);
  }

  async findAll(
    tourOperatorId: string,
    query?: ContractQuery,
  ): Promise<PaginatedResult<SharedContract>> {
    const sanitizedLimit = Math.min(
      query?.limit ?? DEFAULT_PAGINATION_LIMIT,
      MAX_PAGINATION_LIMIT,
    );

    return this.contractRepository.findAll(tourOperatorId, {
      ...query,
      limit: sanitizedLimit,
    });
  }

  async findOne(id: string, tourOperatorId: string): Promise<SharedContract> {
    const contract = await this.contractRepository.findOne(id, tourOperatorId);
    if (!contract) {
      throw new NotFoundException(`Contract ${id} not found`);
    }
    return contract;
  }

  async update(
    id: string,
    dto: UpdateContractDto,
    tourOperatorId: string,
  ): Promise<SharedContract> {
    return await this.contractRepository.update(id, dto, tourOperatorId);
  }

  async remove(id: string, tourOperatorId: string): Promise<void> {
    const result = await this.contractRepository.remove(id, tourOperatorId);
    if (result === RepositoryResult.NOT_FOUND)
      throw new NotFoundException(`Contract ${id} not found`);
  }

  async createPeriod(
    dto: CreateContractPeriodDto,
    contractId: string,
  ): Promise<ContractPeriod> {
    if (dto.seasonPeriodId) {
      const seasonPeriod = await this.contractRepository.findSeasonPeriod(
        dto.seasonPeriodId,
      );
      if (!seasonPeriod) throw new NotFoundException('SeasonPeriod not found');

      dto.startDate = dto.startDate ?? seasonPeriod.startDate.toISOString();
      dto.endDate = dto.endDate ?? seasonPeriod.endDate.toISOString();
    }

    if (!dto.startDate || !dto.endDate) {
      throw new BadRequestException(
        'startDate and endDate are required when seasonPeriodId is not provided',
      );
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    await this.validateNoOverlap(contractId, startDate, endDate);

    try {
      return await this.contractRepository.createPeriod(
        {
          seasonPeriodId: dto.seasonPeriodId,
          name: dto.name,
          startDate,
          endDate,
          baseMealPlanId: dto.baseMealPlanId,
          minStay: dto.minStay,
        },
        contractId,
      );
    } catch (error) {
      this.handleRepositoryError(error, {
        [RepositoryResult.CONFLICT]: `Period name already exists`,
        [RepositoryResult.NOT_FOUND]: `Base Meal Plan  ${dto.baseMealPlanId} not found`,
      });
    }
  }

  async updatePeriod(
    periodId: string,
    dto: UpdateContractPeriodDto,
    contractId: string,
  ): Promise<ContractPeriod> {
    const current = await this.contractRepository.findContractPeriod(
      periodId,
      contractId,
    );
    if (!current) {
      throw new NotFoundException(`Contract Period ${periodId} not found`);
    }

    const startDate = dto.startDate
      ? new Date(dto.startDate)
      : current.startDate;
    const endDate = dto.endDate ? new Date(dto.endDate) : current.endDate;

    await this.validateNoOverlap(contractId, startDate, endDate, periodId);

    try {
      return await this.contractRepository.updatePeriod(
        periodId,
        {
          seasonPeriodId: dto.seasonPeriodId,
          name: dto.name,
          startDate,
          endDate,
          baseMealPlanId: dto.baseMealPlanId,
          minStay: dto.minStay,
        },
        contractId,
      );
    } catch (error) {
      this.handleRepositoryError(error, {
        [RepositoryResult.CONFLICT]: `Period name already exists`,
        [RepositoryResult.NOT_FOUND]: `Base Meal Plan  ${dto.baseMealPlanId} not found`,
      });
    }
  }

  async removePeriod(periodId: string, contractId: string): Promise<void> {
    const result = await this.contractRepository.removePeriod(
      periodId,
      contractId,
    );
    if (result === RepositoryResult.NOT_FOUND)
      throw new NotFoundException(`Contract Period ${periodId} not found`);
  }

  async createRoomPrice(
    dto: CreateRoomPriceDto,
    periodId: string,
    contractId: string,
  ): Promise<RoomPrice> {
    await this.getPeriodOrThrow(periodId, contractId);

    let occupancyRatesData: OccupancyRateCreateData[] | undefined;

    if (dto.pricingMode === 'PER_OCCUPANCY') {
      occupancyRatesData = await this.buildOccupancyRates(
        dto.roomTypeId,
        dto.occupancyRates ?? [],
      );
    }

    try {
      return await this.contractRepository.createRoomPrice(
        {
          roomTypeId: dto.roomTypeId,
          pricingMode: dto.pricingMode,
          pricePerNight:
            dto.pricingMode === 'PER_ROOM' ? dto.pricePerNight : null,
        },
        periodId,
        occupancyRatesData,
      );
    } catch (error) {
      this.handleRepositoryError(error, {
        [RepositoryResult.CONFLICT]: `A room price already exists for this room type in this period`,
        [RepositoryResult.NOT_FOUND]: `Room type ${dto.roomTypeId} not found`,
      });
    }
  }

  async updateRoomPrice(
    id: string,
    dto: UpdateRoomPriceDto,
  ): Promise<RoomPrice> {
    try {
      return await this.contractRepository.updateRoomPrice(id, {
        roomTypeId: dto.roomTypeId,
        pricingMode: dto.pricingMode,
        pricePerNight: dto.pricePerNight,
      });
    } catch (error) {
      this.handleRepositoryError(error, {
        [RepositoryResult.CONFLICT]: `A room price already exists for this room type in this period`,
        [RepositoryResult.NOT_FOUND]: `Room type ${dto.roomTypeId} not found`,
      });
    }
  }

  async removeRoomPrice(id: string): Promise<void> {
    const result = await this.contractRepository.removeRoomPrice(id);
    if (result === RepositoryResult.NOT_FOUND)
      throw new NotFoundException(`Room price ${id} not found`);
  }

  async createMealPlanSupplement(
    dto: CreateMealPlanSupplementDto,
    periodId: string,
    contractId: string,
  ): Promise<MealPlanSupplement> {
    const period = await this.getPeriodOrThrow(periodId, contractId);

    try {
      return await this.contractRepository.createMealPlanSupplement(
        {
          mealPlanId: dto.mealPlanId,
          occupancyRates: dto.occupancyRates,
        },
        period.id,
      );
    } catch (error) {
      this.handleRepositoryError(error, {
        [RepositoryResult.CONFLICT]: `A meal plan already exists for this meal plan in this period`,
        [RepositoryResult.NOT_FOUND]: `Meal plan ${dto.mealPlanId} not found`,
      });
    }
  }

  async updateMealPlanSupplement(
    id: string,
    dto: UpdateMealPlanSupplementDto,
  ): Promise<MealPlanSupplement> {
    try {
      return await this.contractRepository.updateMealPlanSupplement(id, {
        mealPlanId: dto.mealPlanId,
        occupancyRates: dto.occupancyRates,
      });
    } catch (error) {
      this.handleRepositoryError(error, {
        [RepositoryResult.CONFLICT]: `A meal plan already exists for this meal plan in this period`,
        [RepositoryResult.NOT_FOUND]: `Meal plan ${dto.mealPlanId} not found`,
      });
    }
  }

  async removeMealPlanSupplement(id: string): Promise<void> {
    const result = await this.contractRepository.removeMealPlanSupplement(id);
    if (result === RepositoryResult.NOT_FOUND)
      throw new NotFoundException(`Meal plan supplement ${id} not found`);
  }

  async createStopSalesDate(
    dto: CreateStopSalesDateDto,
    contractPeriodId: string,
    contractId: string,
  ): Promise<StopSalesDate> {
    const period = await this.getPeriodOrThrow(contractPeriodId, contractId);

    const date = new Date(dto.date);

    if (date > period.endDate || date < period.startDate)
      throw new BadRequestException(
        'Date is outside the contract period range',
      );

    try {
      return await this.contractRepository.createStopSalesDate(
        { date },
        contractPeriodId,
      );
    } catch (error) {
      this.handleRepositoryError(error, {
        [RepositoryResult.CONFLICT]: `A stop sales date already exists for this date`,
        [RepositoryResult.NOT_FOUND]: `Date ${dto.date} not found`,
      });
    }
  }

  async removeStopSalesDate(id: string): Promise<void> {
    const result = await this.contractRepository.removeStopSalesDate(id);
    if (result === RepositoryResult.NOT_FOUND)
      throw new NotFoundException(`Stop Sales date ${id} not found`);
  }

  private async buildOccupancyRates(
    roomTypeId: string,
    occupancyRates: OccupancyRateDto[],
  ): Promise<OccupancyRateCreateData[]> {
    if (!occupancyRates.length) {
      throw new BadRequestException(
        'occupancy rate is required when pricing mode is PER OCCUPANCY',
      );
    }

    const roomType =
      await this.contractRepository.findRoomTypeWithCapacities(roomTypeId);
    if (!roomType)
      throw new NotFoundException(`room type ${roomTypeId} not found`);

    const totalMaxPax = roomType.capacities.reduce(
      (sum, c) => sum + c.maxPax,
      0,
    );

    return occupancyRates.map((rate) => {
      const totalPax = rate.numAdults + rate.numChildren;

      if (totalPax > totalMaxPax) {
        throw new BadRequestException(
          `Occupancy (${rate.numAdults}A + ${rate.numChildren}C) exceeds room capacity (${totalMaxPax} pax)`,
        );
      }

      const totalRate = Object.values(rate.ratesPerAge).reduce(
        (sum, r) => sum + r,
        0,
      );

      return {
        numAdults: rate.numAdults,
        numChildren: rate.numChildren,
        ratesPerAge: rate.ratesPerAge,
        totalRate,
      };
    });
  }

  private async validateNoOverlap(
    contractId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string,
  ): Promise<void> {
    const overlapping = await this.contractRepository.validateNoOverlap(
      contractId,
      startDate,
      endDate,
      excludeId,
    );
    if (overlapping) {
      throw new ConflictException(
        `Period overlaps with existing period "${overlapping.name}"`,
      );
    }
  }

  private async getPeriodOrThrow(
    periodId: string,
    contractId: string,
  ): Promise<ContractPeriod> {
    const period = await this.contractRepository.findContractPeriod(
      periodId,
      contractId,
    );
    if (!period) {
      throw new NotFoundException(`Contract Period ${periodId} not found`);
    }
    return period;
  }

  private static readonly EXCEPTION_MAP: Partial<
    Record<RepositoryResult, new (message: string) => HttpException>
  > = {
    [RepositoryResult.CONFLICT]: ConflictException,
    [RepositoryResult.NOT_FOUND]: NotFoundException,
    [RepositoryResult.HAS_RELATIONS]: ConflictException,
  };

  private handleRepositoryError(
    error: unknown,
    messages: Partial<Record<RepositoryResult, string>>,
  ): never {
    if (error instanceof RepositoryException) {
      const message = messages[error.result];
      const ExceptionClass = ContractsService.EXCEPTION_MAP[error.result];
      if (message && ExceptionClass) {
        throw new ExceptionClass(message);
      }
    }
    throw error;
  }
}
