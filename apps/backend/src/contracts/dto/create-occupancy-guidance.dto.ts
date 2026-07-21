import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateOccupancyGuidanceDto {
  @IsString()
  @IsNotEmpty()
  roomTypeId: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional() @IsInt() @Min(0) maxAdults?: number;
  @IsOptional() @IsInt() @Min(0) maxTeens?: number;
  @IsOptional() @IsInt() @Min(0) maxChildren?: number;
  @IsOptional() @IsInt() @Min(0) maxInfants?: number;
}
