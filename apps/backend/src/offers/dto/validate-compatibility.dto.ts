import { ArrayMinSize, IsString } from 'class-validator';

export class ValidateCompatibilityDto {
  @ArrayMinSize(1)
  @IsString({ each: true })
  offerIds: string[];
}
