import { IsDateString } from 'class-validator';

export class CreateStopSalesDateDto {
  @IsDateString()
  date: string;
}
