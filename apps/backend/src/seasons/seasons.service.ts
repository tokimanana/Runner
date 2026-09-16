import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Season as PrismaSeason, SeasonPeriod } from '@prisma/client';

import { PaginationQuery } from '@backend/common/pagination.types';
import {
  RepositoryException,
  RepositoryResult,
} from '@backend/common/repository.types';
import { PaginatedResult, Season } from '@runner/shared/types';
import {
  DEFAULT_PAGINATION_LIMIT,
  MAX_PAGINATION_LIMIT,
} from '../common/pagination.constants';
import { CreateSeasonPeriodDto } from './dto/create-season-period.dto';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonPeriodDto } from './dto/update-season-period.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';
import { SeasonPeriodRepository } from './repositories/season-period.repository';
import {
  SeasonRepository,
  SeasonWithPeriods,
} from './repositories/season.repository';

@Injectable()
export class SeasonsService {
  constructor(
    private readonly seasonRepository: SeasonRepository,
    private readonly seasonPeriodRepository: SeasonPeriodRepository,
  ) {}

  async findAll(
    tourOperatorId: string,
    query?: PaginationQuery,
  ): Promise<PaginatedResult<Season>> {
    const { limit = DEFAULT_PAGINATION_LIMIT, offset = 0 } = query ?? {};
    const sanitizedLimit = Math.min(limit, MAX_PAGINATION_LIMIT);

    const seasons = await this.seasonRepository.findAll(tourOperatorId, {
      ...query,
      limit: sanitizedLimit,
      offset,
    });

    return {
      data: seasons.data.map((s) => this.mapToSeason(s)),
      total: seasons.total,
      limit: seasons.limit,
      offset: seasons.offset,
    };
  }

  async findOne(id: string, tourOperatorId: string): Promise<Season> {
    const season = await this.seasonRepository.findOne(id, tourOperatorId);
    if (!season) {
      throw new NotFoundException(`Season ${id} not found`);
    }
    return this.mapToSeason(season);
  }

  async create(
    dto: CreateSeasonDto,
    tourOperatorId: string,
  ): Promise<PrismaSeason> {
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
  ): Promise<PrismaSeason> {
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

  async findAllPeriods(
    seasonId: string,
    query?: PaginationQuery,
  ): Promise<PaginatedResult<SeasonPeriod>> {
    const { limit = DEFAULT_PAGINATION_LIMIT, offset = 0 } = query ?? {};
    const sanitizedLimit = Math.min(limit, MAX_PAGINATION_LIMIT);

    return this.seasonPeriodRepository.findAll(seasonId, {
      ...query,
      limit: sanitizedLimit,
      offset,
    });
  }

  async findOnePeriod(id: string, seasonId: string): Promise<SeasonPeriod> {
    const period = await this.seasonPeriodRepository.findOne(id, seasonId);

    if (!period) {
      throw new NotFoundException(`Season Period ${id} not found`);
    }
    return period;
  }

  async createPeriod(
    dto: CreateSeasonPeriodDto,
    seasonId: string,
  ): Promise<SeasonPeriod> {
    await this.validateNoOverlap(seasonId, dto.startDate, dto.endDate);
    try {
      return await this.seasonPeriodRepository.create(dto, seasonId);
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
    id: string,
    dto: UpdateSeasonPeriodDto,
    seasonId: string,
  ): Promise<SeasonPeriod> {
    const existing = await this.findOnePeriod(id, seasonId);

    const startDate = dto.startDate ?? existing.startDate;
    const endDate = dto.endDate ?? existing.endDate;

    await this.validateNoOverlap(seasonId, startDate, endDate, id);

    return this.seasonPeriodRepository.update(id, dto, seasonId);
  }

  async removePeriod(id: string, seasonId: string): Promise<void> {
    await this.findOnePeriod(id, seasonId);
    const result = await this.seasonPeriodRepository.remove(id, seasonId);
    if (result === RepositoryResult.NOT_FOUND)
      throw new NotFoundException(`Season Period ${id} not found`);
  }

  private async validateNoOverlap(
    seasonId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string,
  ): Promise<void> {
    const overlapping = await this.seasonPeriodRepository.findOverlappingPeriod(
      seasonId,
      startDate,
      endDate,
      excludeId,
    );

    if (overlapping) {
      throw new ConflictException(
        `SeasonPeriod overlaps with existing period "${overlapping.name}"`,
      );
    }
  }

  private mapToSeason(season: SeasonWithPeriods): Season {
    return {
      id: season.id,
      name: season.name,
      tourOperatorId: season.tourOperatorId,
      seasonPeriods: season.seasonPeriods.map((p) => ({
        id: p.id,
        seasonId: p.seasonId,
        name: p.name,
        startDate: p.startDate.toISOString(),
        endDate: p.endDate.toISOString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      createdAt: season.createdAt.toISOString(),
      updatedAt: season.updatedAt.toISOString(),
    };
  }
}
