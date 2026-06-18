import {
  DEFAULT_PAGINATION_LIMIT,
  MAX_PAGINATION_LIMIT,
} from '@backend/common/pagination.constants';
import {
  RepositoryException,
  RepositoryResult,
} from '@backend/common/repository.types';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Contract, ContractPeriod } from '@prisma/client';
import { PaginatedResult } from '@runner/shared/types';
import { ContractQuery } from './contracts.types';
import { CreateContractPeriodDto } from './dto/create-contract-period.dto';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractPeriodDto } from './dto/update-contract-period.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { ContractRepository } from './repositories/contract.repository';

@Injectable()
export class ContractsService {
  constructor(private readonly contractRepository: ContractRepository) {}

  async create(
    dto: CreateContractDto,
    tourOperatorId: string,
  ): Promise<Contract> {
    return this.contractRepository.create(dto, tourOperatorId);
  }

  async findAll(
    tourOperatorId: string,
    query?: ContractQuery,
  ): Promise<PaginatedResult<Contract>> {
    const sanitizedLimit = Math.min(
      query?.limit ?? DEFAULT_PAGINATION_LIMIT,
      MAX_PAGINATION_LIMIT,
    );

    return this.contractRepository.findAll(tourOperatorId, {
      ...query,
      limit: sanitizedLimit,
    });
  }

  async findOne(id: string, tourOperatorId: string): Promise<Contract> {
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
  ): Promise<Contract> {
    return await this.contractRepository.update(id, dto, tourOperatorId);
  }

  async remove(id: string, tourOperatorId: string): Promise<void> {
    const result = await this.contractRepository.remove(id, tourOperatorId);
    if (result === RepositoryResult.NOT_FOUND)
      throw new ConflictException(`Contract ${id} not found`);

    if (result === RepositoryResult.HAS_RELATIONS)
      throw new ConflictException(
        `Contract ${id} cannot be deleted — it has existing relations`,
      );
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

      // Pré-remplir les dates si non fournies explicitement
      dto.startDate = dto.startDate ?? seasonPeriod.startDate;
      dto.endDate = dto.endDate ?? seasonPeriod.endDate;
    }

    await this.validateNoOverlap(contractId, dto.startDate, dto.endDate);

    try {
      return await this.contractRepository.createPeriod(dto, contractId);
    } catch (error) {
      if (
        error instanceof RepositoryException &&
        error.result === RepositoryResult.CONFLICT
      )
        throw new ConflictException(`Period name already exists`);
      throw error;
    }
  }

  async updatePeriod(
    periodId: string,
    dto: UpdateContractPeriodDto,
    contractId: string,
  ): Promise<ContractPeriod> {
    await this.validateNoOverlap(
      contractId,
      dto.startDate,
      dto.endDate,
      periodId,
    );

    try {
      return await this.contractRepository.updatePeriod(
        periodId,
        dto,
        contractId,
      );
    } catch (error) {
      if (
        error instanceof RepositoryException &&
        error.result === RepositoryResult.CONFLICT
      )
        throw new ConflictException(`Period name already exists`);
      throw error;
    }
  }

  async removePeriod(periodId: string, contractId: string): Promise<void> {
    const result = await this.contractRepository.removePeriod(
      periodId,
      contractId,
    );
    if (result === RepositoryResult.NOT_FOUND)
      throw new ConflictException(`Contract Period ${periodId} not found`);

    if (result === RepositoryResult.HAS_RELATIONS)
      throw new ConflictException(
        `Contract ${periodId} cannot be deleted — it has existing relations`,
      );
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
}
