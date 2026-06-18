import { RepositoryResult } from '@backend/common/repository.types';
import { Contract, ContractPeriod, SeasonPeriod } from '@prisma/client';
import { PaginatedResult } from '@runner/shared/types';
import { ContractQuery } from '../contracts.types';
import { CreateContractPeriodDto } from '../dto/create-contract-period.dto';
import { CreateContractDto } from '../dto/create-contract.dto';
import { UpdateContractPeriodDto } from '../dto/update-contract-period.dto';
import { UpdateContractDto } from '../dto/update-contract.dto';

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

  abstract createPeriod(
    dto: CreateContractPeriodDto,
    contractId: string,
  ): Promise<ContractPeriod>;

  abstract updatePeriod(
    periodId: string,
    dto: UpdateContractPeriodDto,
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

  abstract findSeasonPeriod(
    seasonPeriodId: string,
  ): Promise<SeasonPeriod | null>;
}
