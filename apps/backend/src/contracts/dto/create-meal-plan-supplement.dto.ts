import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreateMealPlanSupplementDto {
  @IsString()
  @IsNotEmpty()
  mealPlanId: string;

  @IsObject()
  occupancyRates: Record<string, number>;
}
