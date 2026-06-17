import { PaginationQuery } from '@backend/common/pagination.types';
import { RepositoryResult } from '@backend/common/repository.types';
import { Contract } from '@prisma/client';
import { PaginatedResult } from '@runner/shared/types';
import { CreateContractDto } from '../dto/create-contract.dto';
import { UpdateContractDto } from '../dto/update-contract.dto';

export abstract class ContractRepository {
  abstract findAll(
    tourOperatorId: string,
    query?: PaginationQuery,
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
}
