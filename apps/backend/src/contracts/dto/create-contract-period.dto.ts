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
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  @IsNotEmpty()
  baseMealPlanId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  minStay?: number;
}
