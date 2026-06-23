import { RepositoryResult } from '@backend/common/repository.types';
import {
  Contract,
  ContractPeriod,
  MealPlanSupplement,
  Prisma,
  RoomPrice,
  SeasonPeriod,
} from '@prisma/client';
import { PaginatedResult } from '@runner/shared/types';
import {
  ContractPeriodCreateData,
  ContractPeriodUpdateData,
  ContractQuery,
  MealPlanSupplementCreateData,
  MealPlanSupplementUpdateData,
  OccupancyRateCreateData,
  RoomPriceCreateData,
  RoomPriceUpdateData,
} from '../contracts.types';
import { CreateContractDto } from '../dto/create-contract.dto';
import { UpdateContractDto } from '../dto/update-contract.dto';

export type RoomTypeWithCapacities = Prisma.RoomTypeGetPayload<{
  include: { capacities: true };
}>;

export abstract class ContractRepository {
  abstract findAll(
    tourOperatorId: string,
    query?: ContractQuery,
  ): Promise<PaginatedResult<Contract>>;

  abstract findOne(
    id: string,
    tourOperatorId: string,
  ): Promise<Contract | null>;

  abstract create(
    dto: CreateContractDto,
    tourOperatorId: string,
  ): Promise<Contract>;

  abstract update(
    id: string,
    dto: UpdateContractDto,
    tourOperatorId: string,
  ): Promise<Contract>;

  abstract remove(
    id: string,
    tourOperatorId: string,
  ): Promise<RepositoryResult>;

  abstract findContractPeriod(
    periodId: string,
    contractId: string,
  ): Promise<ContractPeriod | null>;

  abstract findSeasonPeriod(
    seasonPeriodId: string,
  ): Promise<SeasonPeriod | null>;

  abstract createPeriod(
    data: ContractPeriodCreateData,
    contractId: string,
  ): Promise<ContractPeriod>;

  abstract updatePeriod(
    periodId: string,
    data: ContractPeriodUpdateData,
    contractId: string,
  ): Promise<ContractPeriod>;

  abstract removePeriod(
    periodId: string,
    contractId: string,
  ): Promise<RepositoryResult>;

  abstract validateNoOverlap(
    contractId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string,
  ): Promise<ContractPeriod | null>;

  abstract createRoomPrice(
    dto: RoomPriceCreateData,
    contractPeriodId: string,
    occupancyRates?: OccupancyRateCreateData[],
  ): Promise<RoomPrice>;

  abstract updateRoomPrice(
    id: string,
    dto: RoomPriceUpdateData,
  ): Promise<RoomPrice>;

  abstract removeRoomPrice(id: string): Promise<RepositoryResult>;

  abstract findRoomTypeWithCapacities(
    roomTypeId: string,
  ): Promise<RoomTypeWithCapacities | null>;

  abstract createMealPlanSupplement(
    data: MealPlanSupplementCreateData,
    contractPeriodId: string,
  ): Promise<MealPlanSupplement>;

  abstract updateMealPlanSupplement(
    id: string,
    data: MealPlanSupplementUpdateData,
  ): Promise<MealPlanSupplement>;

  abstract removeMealPlanSupplement(id: string): Promise<RepositoryResult>;
}
