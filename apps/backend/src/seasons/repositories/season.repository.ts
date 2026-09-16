import { PaginationQuery } from '@backend/common/pagination.types';
import { RepositoryResult } from '@backend/common/repository.types';
import { Prisma, Season } from '@prisma/client';
import { PaginatedResult } from '@runner/shared/types';
import { CreateSeasonDto } from '../dto/create-season.dto';
import { UpdateSeasonDto } from '../dto/update-season.dto';

export type SeasonWithPeriods = Prisma.SeasonGetPayload<{
  include: { seasonPeriods: true };
}>;

export abstract class SeasonRepository {
  abstract findAll(
    tourOperatorId: string,
    query?: PaginationQuery,
  ): Promise<PaginatedResult<SeasonWithPeriods>>;

  abstract findOne(
    id: string,
    tourOperatorId: string,
  ): Promise<SeasonWithPeriods | null>;

  abstract create(
    dto: CreateSeasonDto,
    tourOperatorId: string,
  ): Promise<Season>;

  abstract update(
    id: string,
    dto: UpdateSeasonDto,
    tourOperatorId: string,
  ): Promise<Season>;

  abstract remove(
    id: string,
    tourOperatorId: string,
  ): Promise<RepositoryResult>;
}
