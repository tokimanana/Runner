import { RepositoryResult } from '@backend/common/repository.types';
import { Supplement } from '@prisma/client';
import { PaginatedResult } from '@runner/shared/types';
import { CreateSupplementDto } from '../dto/create-supplement.dto';
import { UpdateSupplementDto } from '../dto/update-supplement.dto';
import { SupplementQuery } from '../supplements.types';

export abstract class SupplementRepository {
  abstract findAll(
    tourOperatorId: string,
    query?: SupplementQuery,
  ): Promise<PaginatedResult<Supplement>>;
  abstract findOne(
    id: string,
    tourOperatorId: string,
  ): Promise<Supplement | null>;
  abstract create(
    dto: CreateSupplementDto,
    tourOperatorId: string,
  ): Promise<Supplement>;
  abstract update(
    id: string,
    dto: UpdateSupplementDto,
    tourOperatorId: string,
  ): Promise<Supplement>;
  abstract remove(
    id: string,
    tourOperatorId: string,
  ): Promise<RepositoryResult>;
}
