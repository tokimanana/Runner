import { PartialType } from '@nestjs/mapped-types';
import { CreateAgeCategoryDto } from './create-age-category.dto';

export class UpdateAgeCategoryDto extends PartialType(CreateAgeCategoryDto) {}
