import { PaginationQuery } from '@backend/common/pagination.types';
import { RepositoryResult } from '@backend/common/repository.types';
import { Offer, OfferPeriod, OfferSupplement } from '@prisma/client';
import { PaginatedResult } from '@runner/shared/types';
import { CreateOfferDto } from '../dto/create-offer.dto';
import { UpdateOfferDto } from '../dto/update-offer.dto';
import { OfferPeriodCreateData, OfferPeriodUpdateData } from '../offers.types';

export abstract class OfferRepository {
  abstract findAll(
    tourOperatorId: string,
    query?: PaginationQuery,
  ): Promise<PaginatedResult<Offer>>;

  abstract findOne(id: string, tourOperatorId: string): Promise<Offer | null>;

  abstract create(dto: CreateOfferDto, tourOperatorId: string): Promise<Offer>;

  abstract update(
    id: string,
    dto: UpdateOfferDto,
    tourOperatorId: string,
  ): Promise<Offer>;

  abstract remove(
    id: string,
    tourOperatorId: string,
  ): Promise<RepositoryResult>;

  abstract findOfferPeriod(
    periodId: string,
    offerId: string,
    tourOperatorId: string,
  ): Promise<OfferPeriod | null>;

  abstract createPeriod(
    data: OfferPeriodCreateData,
    offerId: string,
  ): Promise<OfferPeriod>;

  abstract updatePeriod(
    periodId: string,
    data: OfferPeriodUpdateData,
    offerId: string,
  ): Promise<OfferPeriod>;

  abstract removePeriod(
    periodId: string,
    offerId: string,
  ): Promise<RepositoryResult>;

  abstract linkSupplement(
    offerId: string,
    supplementId: string,
    applyDiscount: boolean,
  ): Promise<OfferSupplement>;

  abstract unlinkSupplement(
    offerId: string,
    supplementId: string,
  ): Promise<RepositoryResult>;
}
