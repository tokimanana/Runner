import { RepositoryResult } from '@backend/common/repository.types';
import { Currency } from '@prisma/client';
import { CreateCurrencyDto } from '../dto/create-currency.dto';
import { UpdateCurrencyDto } from '../dto/update-currency.dto';

export abstract class CurrencyRepository {
  abstract findAll(): Promise<Currency[]>;
  abstract findOne(id: string): Promise<Currency | null>;
  abstract create(dto: CreateCurrencyDto): Promise<Currency>;
  abstract update(id: string, dto: UpdateCurrencyDto): Promise<Currency>;
  abstract remove(id: string): Promise<RepositoryResult>;
}
