import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateRoomTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsInt()
  @Min(1)
  maxAdults: number;

  @IsInt()
  @Min(0)
  maxChildren: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
