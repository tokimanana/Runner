import { Module } from '@nestjs/common';
import { MealPlansController } from './meal-plans.controller';
import { MealPlansService } from './meal-plans.service';
import { MealPlanRepository } from './repositories/meal-plan.repository';
import { PrismaMealPlanRepository } from './repositories/prisma-meal-plan.repository';

@Module({
  controllers: [MealPlansController],
  providers: [
    MealPlansService,
    {
      provide: MealPlanRepository,
      useClass: PrismaMealPlanRepository,
    },
  ],
})
export class MealPlansModule {}
