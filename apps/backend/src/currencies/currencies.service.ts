import {
  RepositoryException,
  RepositoryResult,
} from '@backend/common/repository.types';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Currency } from '@prisma/client';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { CurrencyRepository } from './repositories/currency.repository';

@Injectable()
export class CurrenciesService {
  constructor(private readonly currencyRepository: CurrencyRepository) {}

  async create(createCurrencyDto: CreateCurrencyDto) {
    try {
      return await this.currencyRepository.create(createCurrencyDto);
    } catch (error) {
      if (
        error instanceof RepositoryException &&
        error.result === RepositoryResult.CONFLICT
      )
        throw new ConflictException(`Currency already exists`);
      throw error;
    }
  }

  async findAll(): Promise<Currency[]> {
    return this.currencyRepository.findAll();
  }

  async findOne(id: string): Promise<Currency> {
    const currency = await this.currencyRepository.findOne(id);
    if (!currency) {
      throw new NotFoundException(`Currency ${id} not found`);
    }
    return currency;
  }

  async update(
    id: string,
    updateCurrencyDto: UpdateCurrencyDto,
  ): Promise<Currency> {
    try {
      return await this.currencyRepository.update(id, updateCurrencyDto);
    } catch (error) {
      if (
        error instanceof RepositoryException &&
        error.result === RepositoryResult.CONFLICT
      )
        throw new ConflictException(`Currency already exists`);
      throw error;
    }
  }

  async remove(id: string) {
    const currency = await this.currencyRepository.remove(id);

    if (currency === RepositoryResult.NOT_FOUND)
      throw new NotFoundException(`Currency ${id} not found`);

    if (currency === RepositoryResult.HAS_CONTRACTS)
      throw new ConflictException(`Currency ${id} has linked Contracts`);
  }
}
