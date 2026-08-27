import { PaginationQuery } from '@backend/common/pagination.types';
import {
  RepositoryException,
  RepositoryResult,
} from '@backend/common/repository.types';
import { PrismaService } from '@backend/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Offer, OfferPeriod, Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PaginatedResult } from '@runner/shared/types';
import { CreateOfferDto } from '../dto/create-offer.dto';
import { UpdateOfferDto } from '../dto/update-offer.dto';
import { OfferPeriodCreateData, OfferPeriodUpdateData } from '../offers.types';
import { OfferRepository } from './offer.repository';

@Injectable()
export class PrismaOfferRepository extends OfferRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    tourOperatorId: string,
    query?: PaginationQuery,
  ): Promise<PaginatedResult<Offer>> {
    const { limit, offset } = query ?? {};

    const where: Prisma.OfferWhereInput = { tourOperatorId };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.offer.findMany({
        where,
        take: limit,
        skip: offset,
        include: { offerPeriods: true, applicableSupplements: true },
      }),
      this.prisma.offer.count({ where }),
    ]);

    return { data, total, limit, offset };
  }

  async findOne(id: string, tourOperatorId: string): Promise<Offer | null> {
    return this.prisma.offer.findUnique({
      where: { id, tourOperatorId },
      include: { offerPeriods: true, applicableSupplements: true },
    });
  }

  async create(dto: CreateOfferDto, tourOperatorId: string): Promise<Offer> {
    try {
      return await this.prisma.offer.create({
        data: { ...dto, tourOperatorId },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      )
        throw new RepositoryException(RepositoryResult.CONFLICT);
      throw error;
    }
  }

  async update(
    id: string,
    dto: UpdateOfferDto,
    tourOperatorId: string,
  ): Promise<Offer> {
    try {
      return await this.prisma.offer.update({
        where: { id, tourOperatorId },
        data: dto,
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      )
        throw new RepositoryException(RepositoryResult.CONFLICT);
      throw error;
    }
  }

  async remove(id: string, tourOperatorId: string): Promise<RepositoryResult> {
    try {
      await this.prisma.offer.delete({
        where: { id, tourOperatorId },
      });
      return RepositoryResult.DELETED;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') return RepositoryResult.NOT_FOUND;
      }
      throw error;
    }
  }

  async findOfferPeriod(
    periodId: string,
    offerId: string,
    tourOperatorId: string,
  ): Promise<OfferPeriod | null> {
    return this.prisma.offerPeriod.findFirst({
      where: {
        id: periodId,
        offerId,
        offer: { tourOperatorId },
      },
    });
  }

  async createPeriod(
    data: OfferPeriodCreateData,
    offerId: string,
  ): Promise<OfferPeriod> {
    try {
      return await this.prisma.offerPeriod.create({
        data: {
          ...data,
          offer: { connect: { id: offerId } },
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new RepositoryException(RepositoryResult.NOT_FOUND);
      throw error;
    }
  }

  async updatePeriod(
    periodId: string,
    data: OfferPeriodUpdateData,
    offerId: string,
  ): Promise<OfferPeriod> {
    try {
      return await this.prisma.offerPeriod.update({
        where: { id: periodId, offerId },
        data,
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new RepositoryException(RepositoryResult.NOT_FOUND);
      throw error;
    }
  }

  async removePeriod(
    periodId: string,
    offerId: string,
  ): Promise<RepositoryResult> {
    try {
      await this.prisma.offerPeriod.delete({
        where: { id: periodId, offerId },
      });
      return RepositoryResult.DELETED;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        return RepositoryResult.NOT_FOUND;
      throw error;
    }
  }
}
