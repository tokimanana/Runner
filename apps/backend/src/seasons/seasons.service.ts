import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Season } from '@prisma/client';

import { PaginationQuery } from '@backend/common/pagination.types';
import {
  RepositoryException,
  RepositoryResult,
} from '@backend/common/repository.types';
import { PaginatedResult } from '@runner/shared/types';
import {
  DEFAULT_PAGINATION_LIMIT,
  MAX_PAGINATION_LIMIT,
} from '../common/pagination.constants';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';
import { SeasonRepository } from './repositories/season.repository';

@Injectable()
export class SeasonsService {
  constructor(private readonly seasonRepository: SeasonRepository) {}

  async findAll(
    tourOperatorId: string,
    query?: PaginationQuery,
  ): Promise<PaginatedResult<Season>> {
    const { limit = DEFAULT_PAGINATION_LIMIT, offset = 0 } = query ?? {};
    const sanitizedLimit = Math.min(limit, MAX_PAGINATION_LIMIT);

    return this.seasonRepository.findAll(tourOperatorId, {
      ...query,
      limit: sanitizedLimit,
      offset,
    });
  }

  async findOne(id: string, tourOperatorId: string): Promise<Season> {
    const season = await this.seasonRepository.findOne(id, tourOperatorId);
    if (!season) {
      throw new NotFoundException(`Season ${id} not found`);
    }
    return season;
  }

  async create(dto: CreateSeasonDto, tourOperatorId: string): Promise<Season> {
    try {
      return await this.seasonRepository.create(dto, tourOperatorId);
    } catch (error) {
      if (
        error instanceof RepositoryException &&
        error.result === RepositoryResult.CONFLICT
      )
        throw new ConflictException(`Season name already exists`);
      throw error;
    }
  }

  async update(
    id: string,
    dto: UpdateSeasonDto,
    tourOperatorId: string,
  ): Promise<Season> {
    try {
      return await this.seasonRepository.update(id, dto, tourOperatorId);
    } catch (error) {
      if (
        error instanceof RepositoryException &&
        error.result === RepositoryResult.CONFLICT
      )
        throw new ConflictException(`Season name already exists`);
      throw error;
    }
  }

  async remove(id: string, tourOperatorId: string): Promise<void> {
    const result = await this.seasonRepository.remove(id, tourOperatorId);

    if (result === RepositoryResult.NOT_FOUND)
      throw new NotFoundException(`Season ${id} not found`);

    if (result === RepositoryResult.HAS_PERIODS)
      throw new ConflictException(
        `Season ${id} cannot be deleted — it is linked to existing contract periods`,
      );
  }
}
