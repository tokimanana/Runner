import { PaginationQuery } from '@backend/common/pagination.types';
import { RepositoryResult } from '@backend/common/repository.types';
import { MealPlan } from '@prisma/client';
import { PaginatedResult } from '@runner/shared/types';
import { CreateMealPlanDto } from '../dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from '../dto/update-meal-plan.dto';

export abstract class MealPlanRepository {
  abstract findAll(
    tourOperatorId: string,
    query?: PaginationQuery,
  ): Promise<PaginatedResult<MealPlan>>;

  abstract findOne(
    id: string,
    tourOperatorId: string,
  ): Promise<MealPlan | null>;

  abstract create(
    dto: CreateMealPlanDto,
    tourOperatorId: string,
  ): Promise<MealPlan>;

  abstract update(
    id: string,
    dto: UpdateMealPlanDto,
    tourOperatorId: string,
  ): Promise<MealPlan>;

  abstract remove(
    id: string,
    tourOperatorId: string,
  ): Promise<RepositoryResult>;
}
