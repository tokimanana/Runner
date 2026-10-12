import { PaginationQuery } from '@backend/common/pagination.types';
import { RepositoryResult } from '@backend/common/repository.types';
import { Offer } from '@prisma/client';
import { PaginatedResult } from '@runner/shared/types';
import { CreateOfferDto } from '../dto/create-offer.dto';
import { UpdateOfferDto } from '../dto/update-offer.dto';

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
}
