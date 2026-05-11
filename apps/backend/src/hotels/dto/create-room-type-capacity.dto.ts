import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateRoomTypeCapacityDto {
  @IsString()
  @IsNotEmpty()
  ageCategoryId: string;

  @IsInt()
  @Min(1)
  maxPax: number;
}
