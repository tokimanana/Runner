import { IsInt, Min } from 'class-validator';

export class UpdateRoomTypeCapacityDto {
  @IsInt()
  @Min(1)
  maxPax?: number;
}
