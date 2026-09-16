import { PartialType } from '@nestjs/mapped-types';
import { CreateAgePolicyDto } from './create-age-policy.dto';

export class UpdateAgePolicyDto extends PartialType(CreateAgePolicyDto) {}
