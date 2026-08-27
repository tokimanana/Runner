import { DiscountMode, OfferType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateOfferDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(OfferType)
  type: OfferType;

  @IsNumber()
  @Min(0)
  value: number;

  @IsEnum(DiscountMode)
  discountMode: DiscountMode;

  @IsBoolean()
  @IsOptional()
  applyToRoomOnly?: boolean;

  @IsBoolean()
  @IsOptional()
  applyToMealSupplements?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(1)
  minStay?: number;
}
