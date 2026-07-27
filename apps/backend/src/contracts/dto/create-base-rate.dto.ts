import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateBaseRateDto {
  @IsString()
  @IsNotEmpty()
  roomTypeId: string;

  @IsNumber()
  @Min(0)
  halfDouble: number;

  @IsNumber()
  @Min(0)
  single: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  thirdPersonAdult?: number | null;
}
