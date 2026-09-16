import { PartialType } from '@nestjs/mapped-types';
import { CreateBaseRateDto } from './create-base-rate.dto';

export class UpdateBaseRateDto extends PartialType(CreateBaseRateDto) {}
