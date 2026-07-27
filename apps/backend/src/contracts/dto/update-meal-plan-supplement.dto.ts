import { PartialType } from '@nestjs/mapped-types';
import { CreateMealPlanSupplementDto } from './create-meal-plan-supplement.dto';

export class UpdateMealPlanSupplementDto extends PartialType(
  CreateMealPlanSupplementDto,
) {}
