import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRoomTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}
