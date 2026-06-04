import { PartialType } from '@nestjs/mapped-types';
import { CreateSupplementDto } from './create-supplement.dto';

export class UpdateSupplementDto extends PartialType(CreateSupplementDto) {}
