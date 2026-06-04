import { RepositoryResult } from '@backend/common/repository.types';
import { Season } from '@prisma/client';
import { PaginatedResult } from '@runner/shared/types';
import { CreateSeasonDto } from '../dto/create-season.dto';
import { UpdateSeasonDto } from '../dto/update-season.dto';
import { SeasonQuery } from '../seasons.type';

export abstract class SeasonRepository {
  abstract findAll(
    tourOperatorId: string,
    query?: SeasonQuery,
  ): Promise<PaginatedResult<Season>>;

  abstract findOne(id: string, tourOperatorId: string): Promise<Season | null>;

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
