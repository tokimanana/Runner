import { Module } from '@nestjs/common';
import { MealPlansService } from './meal-plans.service';
import { MealPlansController } from './meal-plans.controller';

@Module({
  controllers: [MealPlansController],
  providers: [MealPlansService],
})
export class MealPlansModule {}
