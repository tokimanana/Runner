import {
  RepositoryException,
  RepositoryResult,
} from '@backend/common/repository.types';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MealPlan } from '@prisma/client';
import { PaginatedResult } from '@runner/shared/types';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';
import { MealPlanQuery } from './meal-plans.type';
import { MealPlanRepository } from './repositories/meal-plan.repository';

const MAX_LIMIT = 100;

@Injectable()
export class MealPlansService {
  constructor(private readonly mealPlanRepository: MealPlanRepository) {}

  async create(
    createMealPlanDto: CreateMealPlanDto,
    tourOperatorId: string,
  ): Promise<MealPlan> {
    try {
      return await this.mealPlanRepository.create(
        createMealPlanDto,
        tourOperatorId,
      );
    } catch (error) {
      if (
        error instanceof RepositoryException &&
        error.result === RepositoryResult.CONFLICT
      )
        throw new ConflictException(`Meal Plan name already exists`);
      throw error;
    }
  }

  async findAll(
    tourOperatorId: string,
    query?: MealPlanQuery,
  ): Promise<PaginatedResult<MealPlan>> {
    const { limit = 50, offset = 0 } = query ?? {};
    const sanitizedLimit = Math.min(limit, MAX_LIMIT);

    return this.mealPlanRepository.findAll(tourOperatorId, {
      ...query,
      limit: sanitizedLimit,
      offset,
    });
  }

  async findOne(id: string, tourOperatorId: string): Promise<MealPlan> {
    const mealPlan = await this.mealPlanRepository.findOne(id, tourOperatorId);
    if (!mealPlan) {
      throw new NotFoundException(`Meal Plan ${id} not found`);
    }
    return mealPlan;
  }

  async update(
    id: string,
    dto: UpdateMealPlanDto,
    tourOperatorId: string,
  ): Promise<MealPlan> {
    try {
      return await this.mealPlanRepository.update(id, dto, tourOperatorId);
    } catch (error) {
      if (
        error instanceof RepositoryException &&
        error.result === RepositoryResult.CONFLICT
      )
        throw new ConflictException(`Meal Plan name already exists`);
      throw error;
    }
  }

  async remove(id: string, tourOperatorId: string): Promise<void> {
    const result = await this.mealPlanRepository.remove(id, tourOperatorId);

    if (result === RepositoryResult.NOT_FOUND)
      throw new NotFoundException(`Meal Plan ${id} not found`);

    if (result === RepositoryResult.HAS_CONTRACTS)
      throw new ConflictException(`Meal Plan ${id} has linked Contracts`);
  }
}
