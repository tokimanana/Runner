import {
  RepositoryException,
  RepositoryResult,
} from '@backend/common/repository.types';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Market } from '@prisma/client';
import { PaginatedResult } from '@runner/shared/types';
import {
  DEFAULT_PAGINATION_LIMIT,
  MAX_PAGINATION_LIMIT,
} from '../common/pagination.constants';
import { CreateMarketDto } from './dto/create-market.dto';
import { UpdateMarketDto } from './dto/update-market.dto';
import { MarketQuery } from './market.types';
import { MarketRepository } from './repository/market.repository';

@Injectable()
export class MarketsService {
  constructor(private readonly marketRepository: MarketRepository) {}

  async create(
    createMealPlanDto: CreateMarketDto,
    tourOperatorId: string,
  ): Promise<Market> {
    try {
      return await this.marketRepository.create(
        createMealPlanDto,
        tourOperatorId,
      );
    } catch (error) {
      if (
        error instanceof RepositoryException &&
        error.result === RepositoryResult.CONFLICT
      )
        throw new ConflictException(`Market name already exists`);
      throw error;
    }
  }

  async findAll(
    tourOperatorId: string,
    query?: MarketQuery,
  ): Promise<PaginatedResult<Market>> {
    const { limit = DEFAULT_PAGINATION_LIMIT, offset = 0 } = query ?? {};
    const sanitizedLimit = Math.min(limit, MAX_PAGINATION_LIMIT);

    return this.marketRepository.findAll(tourOperatorId, {
      ...query,
      limit: sanitizedLimit,
      offset,
    });
  }

  async findOne(id: string, tourOperatorId: string): Promise<Market> {
    const market = await this.marketRepository.findOne(id, tourOperatorId);
    if (!market) {
      throw new NotFoundException(`Market ${id} not found`);
    }
    return market;
  }

  async update(
    id: string,
    dto: UpdateMarketDto,
    tourOperatorId: string,
  ): Promise<Market> {
    await this.findOne(id, tourOperatorId);
    try {
      return await this.marketRepository.update(id, dto, tourOperatorId);
    } catch (error) {
      if (
        error instanceof RepositoryException &&
        error.result === RepositoryResult.CONFLICT
      )
        throw new ConflictException(`Market name already exists`);
      throw error;
    }
  }

  async remove(id: string, tourOperatorId: string): Promise<void> {
    const result = await this.marketRepository.remove(id, tourOperatorId);

    if (result === RepositoryResult.NOT_FOUND)
      throw new NotFoundException(`Market ${id} not found`);

    if (result === RepositoryResult.HAS_CONTRACTS)
      throw new ConflictException(`Market ${id} has linked Contracts`);
  }
}
