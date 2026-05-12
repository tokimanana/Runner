import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MealPlansService } from './meal-plans.service';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';

@Controller('meal-plans')
export class MealPlansController {
  constructor(private readonly mealPlansService: MealPlansService) {}

  @Post()
  create(@Body() createMealPlanDto: CreateMealPlanDto) {
    return this.mealPlansService.create(createMealPlanDto);
  }

  @Get()
  findAll() {
    return this.mealPlansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mealPlansService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMealPlanDto: UpdateMealPlanDto) {
    return this.mealPlansService.update(+id, updateMealPlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mealPlansService.remove(+id);
  }
}
