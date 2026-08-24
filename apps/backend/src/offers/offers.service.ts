import {
  RepositoryException,
  RepositoryResult,
} from '@backend/common/repository.types';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Offer as PrismaOfferType } from '@prisma/client';
import { Offer, PaginatedResult } from '@runner/shared/types';
import {
  DEFAULT_PAGINATION_LIMIT,
  MAX_PAGINATION_LIMIT,
} from '../common/pagination.constants';
import { PaginationQuery } from '../common/pagination.types';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { OfferRepository } from './repositories/offer.repository';

@Injectable()
export class OffersService {
  constructor(private readonly offerRepository: OfferRepository) {}

  private mapOffer(offer: PrismaOfferType): Offer {
    return {
      ...offer,
      value: Number(offer.value),
      createdAt: offer.createdAt.toISOString(),
      updatedAt: offer.updatedAt.toISOString(),
    };
  }

  async create(dto: CreateOfferDto, tourOperatorId: string): Promise<Offer> {
    try {
      const offer = await this.offerRepository.create(dto, tourOperatorId);
      return this.mapOffer(offer);
    } catch (error) {
      if (
        error instanceof RepositoryException &&
        error.result === RepositoryResult.CONFLICT
      )
        throw new ConflictException(`Offer already exists`);
      throw error;
    }
  }

  async findAll(
    tourOperatorId: string,
    query?: PaginationQuery,
  ): Promise<PaginatedResult<Offer>> {
    const { limit = DEFAULT_PAGINATION_LIMIT, offset = 0 } = query ?? {};
    const sanitizedLimit = Math.min(limit, MAX_PAGINATION_LIMIT);
    const result = await this.offerRepository.findAll(tourOperatorId, {
      limit: sanitizedLimit,
      offset,
    });
    return {
      ...result,
      data: result.data.map((offer) => this.mapOffer(offer)),
    };
  }

  async findOne(id: string, tourOperatorId: string): Promise<Offer> {
    const offer = await this.offerRepository.findOne(id, tourOperatorId);
    if (!offer) {
      throw new NotFoundException(`Offer ${id} not found`);
    }
    return this.mapOffer(offer);
  }

  async update(
    id: string,
    dto: UpdateOfferDto,
    tourOperatorId: string,
  ): Promise<Offer> {
    await this.findOne(id, tourOperatorId);
    try {
      const offer = await this.offerRepository.update(id, dto, tourOperatorId);
      return this.mapOffer(offer);
    } catch (error) {
      if (
        error instanceof RepositoryException &&
        error.result === RepositoryResult.CONFLICT
      )
        throw new ConflictException(`Offer already exists`);
      throw error;
    }
  }

  async remove(id: string, tourOperatorId: string): Promise<void> {
    const result = await this.offerRepository.remove(id, tourOperatorId);
    if (result === RepositoryResult.NOT_FOUND)
      throw new NotFoundException(`Offer ${id} not found`);
  }
}
