import {
  RepositoryException,
  RepositoryResult,
} from '@backend/common/repository.types';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OfferPeriod, Offer as PrismaOfferType } from '@prisma/client';
import { Offer, PaginatedResult } from '@runner/shared/types';
import {
  DEFAULT_PAGINATION_LIMIT,
  MAX_PAGINATION_LIMIT,
} from '../common/pagination.constants';
import { PaginationQuery } from '../common/pagination.types';
import { CreateOfferPeriodDto } from './dto/create-offer-period.dto';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferPeriodDto } from './dto/update-offer-period.dto';
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

  // ─── OfferPeriod ─────────────────────────────────────────────

  async createPeriod(
    dto: CreateOfferPeriodDto,
    offerId: string,
    tourOperatorId: string,
  ): Promise<OfferPeriod> {
    await this.findOne(offerId, tourOperatorId);

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    this.validatePeriodDates(startDate, endDate);

    return this.offerRepository.createPeriod({ startDate, endDate }, offerId);
  }

  async updatePeriod(
    periodId: string,
    dto: UpdateOfferPeriodDto,
    offerId: string,
    tourOperatorId: string,
  ): Promise<OfferPeriod> {
    const current = await this.getOfferPeriodOrThrow(
      periodId,
      offerId,
      tourOperatorId,
    );

    const startDate = dto.startDate
      ? new Date(dto.startDate)
      : current.startDate;
    const endDate = dto.endDate ? new Date(dto.endDate) : current.endDate;
    this.validatePeriodDates(startDate, endDate);

    return this.offerRepository.updatePeriod(
      periodId,
      { startDate, endDate },
      offerId,
    );
  }

  async removePeriod(
    periodId: string,
    offerId: string,
    tourOperatorId: string,
  ): Promise<void> {
    await this.getOfferPeriodOrThrow(periodId, offerId, tourOperatorId);
    const result = await this.offerRepository.removePeriod(periodId, offerId);
    if (result === RepositoryResult.NOT_FOUND)
      throw new NotFoundException(`Offer Period ${periodId} not found`);
  }

  private validatePeriodDates(startDate: Date, endDate: Date): void {
    if (startDate >= endDate) {
      throw new BadRequestException('startDate must be before endDate');
    }
  }

  private async getOfferPeriodOrThrow(
    periodId: string,
    offerId: string,
    tourOperatorId: string,
  ): Promise<OfferPeriod> {
    const period = await this.offerRepository.findOfferPeriod(
      periodId,
      offerId,
      tourOperatorId,
    );
    if (!period) {
      throw new NotFoundException(`Offer Period ${periodId} not found`);
    }
    return period;
  }
}
