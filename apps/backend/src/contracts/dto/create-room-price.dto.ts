import { PricingMode } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class OccupancyRateDto {
  @IsInt()
  @Min(1)
  numAdults: number;

  @IsInt()
  @Min(0)
  numChildren: number;

  @IsObject()
  ratesPerAge: Record<string, number>;
}

export class CreateRoomPriceDto {
  @IsString()
  @IsNotEmpty()
  roomTypeId: string;

  @IsEnum(PricingMode)
  pricingMode: PricingMode;

  @ValidateIf((o: CreateRoomPriceDto) => o.pricingMode === 'PER_ROOM')
  @IsNumber()
  @Min(0)
  pricePerNight?: number | null;

  @ValidateIf((o: CreateRoomPriceDto) => o.pricingMode === 'PER_OCCUPANCY')
  @ValidateNested({ each: true })
  @Type(() => OccupancyRateDto)
  occupancyRates?: OccupancyRateDto[];
}
