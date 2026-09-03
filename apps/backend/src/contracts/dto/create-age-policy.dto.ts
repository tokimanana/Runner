import { BaseRateReference, SharingType } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class CreateAgePolicyDto {
  @IsString()
  @IsNotEmpty()
  roomTypeId: string;

  @IsString()
  @IsNotEmpty()
  ageCategoryId: string;

  @IsEnum(SharingType)
  sharingType: SharingType;

  @IsInt()
  @Min(1)
  occurrenceIndex: number;

  @IsEnum(BaseRateReference)
  baseRateReference: BaseRateReference;

  @IsNumber()
  @Min(0)
  value: number;
}
