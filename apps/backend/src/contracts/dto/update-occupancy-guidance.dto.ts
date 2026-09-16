import { PartialType } from '@nestjs/mapped-types';
import { CreateOccupancyGuidanceDto } from './create-occupancy-guidance.dto';

export class UpdateOccupancyGuidanceDto extends PartialType(
  CreateOccupancyGuidanceDto,
) {}
