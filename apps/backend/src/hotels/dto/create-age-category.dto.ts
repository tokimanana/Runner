import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateAgeCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(0)
  minAge: number;

  @IsInt()
  @Min(1)
  maxAge: number;

  @IsInt()
  @IsOptional()
  order?: number;
}
