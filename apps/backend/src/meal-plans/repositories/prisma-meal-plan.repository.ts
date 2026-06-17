import { PaginationQuery } from '@backend/common/pagination.types';
import {
  RepositoryException,
  RepositoryResult,
} from '@backend/common/repository.types';
import { Injectable } from '@nestjs/common';
import { MealPlan, Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PaginatedResult } from '@runner/shared/types';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMealPlanDto } from '../dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from '../dto/update-meal-plan.dto';
import { MealPlanRepository } from './meal-plan.repository';

@Injectable()
export class PrismaMealPlanRepository extends MealPlanRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    tourOperatorId: string,
    query?: PaginationQuery,
  ): Promise<PaginatedResult<MealPlan>> {
    const { limit, offset } = query ?? {};

    const where = { tourOperatorId };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.mealPlan.findMany({
        where,
        take: limit,
        skip: offset,
      }),
      this.prisma.mealPlan.count({ where }),
    ]);
    return { data, total, limit, offset };
  }

  async findOne(id: string, tourOperatorId: string): Promise<MealPlan | null> {
    return this.prisma.mealPlan.findUnique({
      where: { id, tourOperatorId },
    });
  }

  async create(
    dto: CreateMealPlanDto,
    tourOperatorId: string,
  ): Promise<MealPlan> {
    try {
      return await this.prisma.mealPlan.create({
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
    dto: UpdateMealPlanDto,
    tourOperatorId: string,
  ): Promise<MealPlan> {
    try {
      return await this.prisma.mealPlan.update({
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
      await this.prisma.mealPlan.delete({
        where: { id, tourOperatorId },
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
