import { SharingType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateAgePolicyDto {
  @IsString()
  @IsNotEmpty()
  ageCategoryId: string;

  @IsEnum(SharingType)
  sharingType: SharingType;

  @IsNumber()
  @Min(0)
  value: number;
}
