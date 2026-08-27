import { IsDateString } from 'class-validator';

export class CreateOfferPeriodDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
