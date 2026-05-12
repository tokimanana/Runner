import { Injectable } from '@nestjs/common';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';

@Injectable()
export class MealPlansService {
  create(createMealPlanDto: CreateMealPlanDto) {
    return 'This action adds a new mealPlan';
  }

  findAll() {
    return `This action returns all mealPlans`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mealPlan`;
  }

  update(id: number, updateMealPlanDto: UpdateMealPlanDto) {
    return `This action updates a #${id} mealPlan`;
  }

  remove(id: number) {
    return `This action removes a #${id} mealPlan`;
  }
}
