import {
  RepositoryException,
  RepositoryResult,
} from '@backend/common/repository.types';
import { PrismaService } from '@backend/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Currency, Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateCurrencyDto } from '../dto/create-currency.dto';
import { UpdateCurrencyDto } from '../dto/update-currency.dto';
import { CurrencyRepository } from './currency.repository';

@Injectable()
export class PrismaCurrencyRepository extends CurrencyRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(): Promise<Currency[]> {
    return this.prisma.currency.findMany();
  }

  async findOne(id: string): Promise<Currency | null> {
    return this.prisma.currency.findUnique({
      where: { id },
    });
  }

  async create(dto: CreateCurrencyDto): Promise<Currency> {
    try {
      return await this.prisma.currency.create({
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

  async update(id: string, dto: UpdateCurrencyDto): Promise<Currency> {
    try {
      return await this.prisma.currency.update({
        where: { id },
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

  async remove(id: string): Promise<RepositoryResult> {
    try {
      await this.prisma.currency.delete({
        where: { id },
      });
      return RepositoryResult.DELETED;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') return RepositoryResult.NOT_FOUND;
        if (error.code === 'P2003') return RepositoryResult.HAS_CONTRACTS;
      }
      throw error;
    }
  }
}
