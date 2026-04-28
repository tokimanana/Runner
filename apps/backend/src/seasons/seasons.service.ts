import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Season } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { DeleteResult, PaginatedResult } from '@runner/shared/types';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';
import { SeasonRepository } from './repositories/season.repository';
import { SeasonQuery } from './seasons.type';

const MAX_LIMIT = 100;

@Injectable()
export class SeasonsService {
  constructor(private readonly seasonRepository: SeasonRepository) {}

  async findAll(
    tourOperatorId: string,
    query?: SeasonQuery,
  ): Promise<PaginatedResult<Season>> {
    const { limit = 50, offset = 0 } = query ?? {};
    const sanitizedLimit = Math.min(limit, MAX_LIMIT);

    return this.seasonRepository.findAll(tourOperatorId, {
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
    const result = await this.seasonRepository.remove(id, tourOperatorId);

    if (result === DeleteResult.NOT_FOUND)
      throw new NotFoundException(`Season ${id} not found`);

    if (result === DeleteResult.HAS_CONTRACTS)
      throw new ConflictException(`Season ${id} has linked Periods`);
  }

  private validateDates(startDate: Date, endDate: Date): void {
    if (endDate <= startDate) {
      throw new BadRequestException('endDate must be after startDate');
    }
  }
}
