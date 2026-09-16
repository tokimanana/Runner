import { PartialType } from '@nestjs/mapped-types';
import { CreateSeasonPeriodDto } from './create-season-period.dto';

export class UpdateSeasonPeriodDto extends PartialType(CreateSeasonPeriodDto) {}
