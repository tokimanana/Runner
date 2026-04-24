// create-room-type.dto.ts
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateRoomTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsInt()
  @Min(0)
  maxAdults: number;

  @IsInt()
  @Min(0)
  maxChildren: number;

  @IsInt()
  @Min(0)
  order?: number;
}
