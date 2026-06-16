import { PaginationQuery } from '@backend/common/pagination.types';
import { RepositoryResult } from '@backend/common/repository.types';
import { SeasonPeriod } from '@prisma/client';
import { PaginatedResult } from '@runner/shared/types';
import { CreateSeasonPeriodDto } from '../dto/create-season-period.dto';
import { UpdateSeasonPeriodDto } from '../dto/update-season-period.dto';

export abstract class SeasonPeriodRepository {
  abstract findAll(
    seasonId: string,
    query?: PaginationQuery,
  ): Promise<PaginatedResult<SeasonPeriod>>;

  abstract findOne(id: string, seasonId: string): Promise<SeasonPeriod | null>;

  abstract create(
    dto: CreateSeasonPeriodDto,
    seasonId: string,
  ): Promise<SeasonPeriod>;

  abstract update(
    id: string,
    dto: UpdateSeasonPeriodDto,
    seasonId: string,
  ): Promise<SeasonPeriod>;

  abstract remove(id: string, seasonId: string): Promise<RepositoryResult>;
}
