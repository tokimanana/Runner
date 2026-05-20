import {
  RepositoryException,
  RepositoryResult,
} from '@backend/common/repository.types';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Supplement as PrismaSupplementType } from '@prisma/client';
import { PaginatedResult, Supplement } from '@runner/shared/types';
import {
  DEFAULT_PAGINATION_LIMIT,
  MAX_PAGINATION_LIMIT,
} from '../common/pagination.constants';
import { CreateSupplementDto } from './dto/create-supplement.dto';
import { UpdateSupplementDto } from './dto/update-supplement.dto';
import { SupplementRepository } from './repositories/supplement.repository';
import { SupplementQuery } from './supplements.types';

@Injectable()
export class SupplementsService {
  constructor(private readonly supplementRepository: SupplementRepository) {}

  private mapSupplement(sup: PrismaSupplementType): Supplement {
    return {
      ...sup,
      price: Number(sup.price),
      createdAt: sup.createdAt.toISOString(),
      updatedAt: sup.updatedAt.toISOString(),
    };
  }

  async create(
    dto: CreateSupplementDto,
    tourOperatorId: string,
  ): Promise<Supplement> {
    try {
      const sup = await this.supplementRepository.create(dto, tourOperatorId);
      return this.mapSupplement(sup);
    } catch (error) {
      if (
        error instanceof RepositoryException &&
        error.result === RepositoryResult.CONFLICT
      )
        throw new ConflictException(`Supplement already exists`);
      throw error;
    }
  }

  async findAll(
    tourOperatorId: string,
    query?: SupplementQuery,
  ): Promise<PaginatedResult<Supplement>> {
    const { limit = DEFAULT_PAGINATION_LIMIT, offset = 0 } = query ?? {};
    const sanitizedLimit = Math.min(limit, MAX_PAGINATION_LIMIT);
    const result = await this.supplementRepository.findAll(tourOperatorId, {
      ...query,
      limit: sanitizedLimit,
      offset,
    });
    return {
      ...result,
      data: result.data.map((sup) => this.mapSupplement(sup)),
    };
  }

  async findOne(id: string, tourOperatorId: string): Promise<Supplement> {
    const supplement = await this.supplementRepository.findOne(
      id,
      tourOperatorId,
    );
    if (!supplement) {
      throw new NotFoundException(`Supplement ${id} not found`);
    }
    return this.mapSupplement(supplement);
  }

  async update(
    id: string,
    dto: UpdateSupplementDto,
    tourOperatorId: string,
  ): Promise<Supplement> {
    await this.findOne(id, tourOperatorId);
    try {
      const supplement = await this.supplementRepository.update(
        id,
        dto,
        tourOperatorId,
      );
      return this.mapSupplement(supplement);
    } catch (error) {
      if (
        error instanceof RepositoryException &&
        error.result === RepositoryResult.CONFLICT
      )
        throw new ConflictException(`Supplement already exists`);
      throw error;
    }
  }

  async remove(id: string, tourOperatorId: string): Promise<void> {
    const result = await this.supplementRepository.remove(id, tourOperatorId);
    if (result === RepositoryResult.NOT_FOUND)
      throw new NotFoundException(`Supplement ${id} not found`);
    if (result === RepositoryResult.HAS_CONTRACTS)
      throw new ConflictException(
        `Supplement ${id} is referenced and cannot be deleted`,
      );
  }
}
