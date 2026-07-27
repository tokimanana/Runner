import {
  DEFAULT_PAGINATION_LIMIT,
  MAX_PAGINATION_LIMIT,
} from '@backend/common/pagination.constants';
import { RepositoryResult } from '@backend/common/repository.types';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Contract } from '@prisma/client';
import { PaginatedResult } from '@runner/shared/types';
import { ContractQuery } from './contracts.types';
import { CreateContractDto } from './dto/create-contract.dto';
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
}
