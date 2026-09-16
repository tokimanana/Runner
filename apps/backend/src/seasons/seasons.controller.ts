import { Roles } from '@backend/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@backend/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@backend/auth/guards/roles.guard';
import { RequestWithUser } from '@backend/auth/types/jwt-user.type';
import { PaginationQuery } from '@backend/common/pagination.types';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CreateSeasonPeriodDto } from './dto/create-season-period.dto';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonPeriodDto } from './dto/update-season-period.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';
import { SeasonsService } from './seasons.service';

@Controller('seasons')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class SeasonsController {
  constructor(private readonly seasonService: SeasonsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createSeasonDto: CreateSeasonDto,
    @Req() req: RequestWithUser,
  ) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.seasonService.create(createSeasonDto, tourOperatorId);
  }

  @Get()
  findAll(
    @Req() req: RequestWithUser,
    @Query() { limit, offset }: PaginationQuery,
  ) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.seasonService.findAll(tourOperatorId, {
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.seasonService.findOne(id, tourOperatorId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSeasonDto: UpdateSeasonDto,
    @Req() req: RequestWithUser,
  ) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.seasonService.update(id, updateSeasonDto, tourOperatorId);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.seasonService.remove(id, tourOperatorId);
  }

  @Get(':id/periods')
  findAllSeasonPeriods(
    @Param('id') seasonId: string,
    @Query() { limit, offset }: PaginationQuery,
  ) {
    return this.seasonService.findAllPeriods(seasonId, {
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Post(':id/periods')
  @HttpCode(HttpStatus.CREATED)
  createSeasonPeriod(
    @Param('id') seasonId: string,
    @Body() dto: CreateSeasonPeriodDto,
  ) {
    return this.seasonService.createPeriod(dto, seasonId);
  }

  @Patch(':id/periods/:periodId')
  updateOnePeriod(
    @Param('id') seasonId: string,
    @Body() dto: UpdateSeasonPeriodDto,
    @Param('periodId') periodId: string,
  ) {
    return this.seasonService.updatePeriod(periodId, dto, seasonId);
  }

  @Delete(':id/periods/:periodId')
  @HttpCode(204)
  removeOnePeriod(
    @Param('id') seasonId: string,
    @Param('periodId') periodId: string,
  ) {
    return this.seasonService.removePeriod(periodId, seasonId);
  }
}
