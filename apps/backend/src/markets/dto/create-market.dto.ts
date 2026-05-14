import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMarketDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
