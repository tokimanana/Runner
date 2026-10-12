import { PartialType } from '@nestjs/mapped-types';
import { CreateOfferPeriodDto } from './create-offer-period.dto';

export class UpdateOfferPeriodDto extends PartialType(CreateOfferPeriodDto) {}
