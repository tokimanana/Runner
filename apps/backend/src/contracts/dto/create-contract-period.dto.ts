import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateContractPeriodDto {
  // Optionnel — pour classification/reporting uniquement
  @IsOptional()
  @IsString()
  seasonPeriodId?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  // Source de vérité contractuelle
  @IsDateString()
  @Type(() => Date)
  startDate: Date;

  @IsDateString()
  @Type(() => Date)
  endDate: Date;

  @IsString()
  @IsNotEmpty()
  baseMealPlanId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  minStay?: number;
}
