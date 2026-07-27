import { BillingUnit } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreateMealPlanSupplementDto {
  @IsString()
  @IsNotEmpty()
  mealPlanId: string;

  @IsEnum(BillingUnit)
  billingUnit: BillingUnit;

  @IsObject()
  occupancyRates: Record<string, number>;
}
