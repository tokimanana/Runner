import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateOfferSupplementDto {
  @IsString()
  supplementId: string;

  @IsOptional()
  @IsBoolean()
  applyDiscount?: boolean;
}
