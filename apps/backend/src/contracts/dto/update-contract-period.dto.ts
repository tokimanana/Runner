import { PartialType } from '@nestjs/mapped-types';
import { CreateContractPeriodDto } from './create-contract-period.dto';

export class UpdateContractPeriodDto extends PartialType(
  CreateContractPeriodDto,
) {}
