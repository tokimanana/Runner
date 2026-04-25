import { Season } from '@prisma/client';
import { CreateSeasonDto } from '../dto/create-season.dto';
import { UpdateSeasonDto } from '../dto/update-season.dto';

export abstract class SeasonRepository {
  abstract findAll(
    tourOperatorId: string,
    query?: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ data: Season[]; total: number; limit: number; offset: number }>;

  abstract findOne(id: string, tourOperatorId: string): Promise<Season | null>;

  abstract create(
    dto: CreateSeasonDto,
    tourOperatorId: string,
  ): Promise<Season>;

  abstract update(
    id: string,
    dto: UpdateSeasonDto,
    tourOperatorId: string,
  ): Promise<Season>;

  abstract remove(id: string, tourOperatorId: string): Promise<void>;
}
