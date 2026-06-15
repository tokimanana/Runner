import { PaginationQuery } from '@backend/common/pagination.types';
import { RepositoryResult } from '@backend/common/repository.types';
import { Market } from '@prisma/client';
import { PaginatedResult } from '@runner/shared/types';
import { CreateMarketDto } from '../dto/create-market.dto';
import { UpdateMarketDto } from '../dto/update-market.dto';

export abstract class MarketRepository {
  abstract findAll(
    tourOperatorId: string,
    query?: PaginationQuery,
  ): Promise<PaginatedResult<Market>>;

  abstract findOne(id: string, tourOperatorId: string): Promise<Market | null>;

  abstract create(
    dto: CreateMarketDto,
    tourOperatorId: string,
  ): Promise<Market>;

  abstract update(
    id: string,
    dto: UpdateMarketDto,
    tourOperatorId: string,
  ): Promise<Market>;

  abstract remove(
    id: string,
    tourOperatorId: string,
  ): Promise<RepositoryResult>;
}
