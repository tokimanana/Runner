import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Season } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';
import { SeasonRepository } from './repositories/season.repository';

@Injectable()
export class SeasonsService {
  constructor(private readonly seasonRepository: SeasonRepository) {}

  async findAll(
    tourOperatorId: string,
    query?: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    },
  ): Promise<{
    data: Season[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const MAX_LIMIT = 100;
    const { limit = 50, offset = 0 } = query ?? {};
    const sanitizedLimit = Math.min(limit, MAX_LIMIT);

    return await this.seasonRepository.findAll(tourOperatorId, {
      ...query,
      limit: sanitizedLimit,
      offset,
    });
  }

  async findOne(id: string, tourOperatorId: string): Promise<Season> {
    const season = await this.seasonRepository.findOne(id, tourOperatorId);
    if (!season) {
      throw new NotFoundException(`Season ${id} not found`);
    }
    return season;
  }

  async create(dto: CreateSeasonDto, tourOperatorId: string): Promise<Season> {
    this.validateDates(dto.startDate, dto.endDate);
    try {
      return await this.seasonRepository.create(dto, tourOperatorId);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(`Season name already exists`);
      }
      throw error;
    }
  }

  async update(
    id: string,
    dto: UpdateSeasonDto,
    tourOperatorId: string,
  ): Promise<Season> {
    const existing = await this.findOne(id, tourOperatorId);
    const startDate = dto.startDate ?? existing.startDate;
    const endDate = dto.endDate ?? existing.endDate;

    this.validateDates(startDate, endDate);

    try {
      return await this.seasonRepository.update(id, dto, tourOperatorId);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(`Season name already exists`);
      }
      throw error;
    }
  }

  async remove(id: string, tourOperatorId: string): Promise<void> {
    try {
      await this.seasonRepository.remove(id, tourOperatorId);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Season ${id} not found`);
        }
        if (error.code === 'P2003') {
          throw new ConflictException(`Season ${id} has linked Periods`);
        }
      }
      throw error;
    }
  }

  private validateDates(startDate: Date, endDate: Date): void {
    if (endDate <= startDate) {
      throw new BadRequestException('endDate must be after startDate');
    }
  }
}
