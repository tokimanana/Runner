import { Roles } from '@backend/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@backend/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@backend/auth/guards/roles.guard';
import { RequestWithUser } from '@backend/auth/types/jwt-user.type';
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
import { CreateMarketDto } from './dto/create-market.dto';
import { UpdateMarketDto } from './dto/update-market.dto';
import { MarketQuery } from './market.types';
import { MarketsService } from './markets.service';

@Controller('markets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class MarketsController {
  constructor(private readonly marketsService: MarketsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createMarketDto: CreateMarketDto,
    @Req() req: RequestWithUser,
  ) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.marketsService.create(createMarketDto, tourOperatorId);
  }

  @Get()
  findAll(
    @Req() req: RequestWithUser,
    @Query() { limit, offset }: MarketQuery,
  ) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.marketsService.findAll(tourOperatorId, {
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.marketsService.findOne(id, tourOperatorId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMarketDto: UpdateMarketDto,
    @Req() req: RequestWithUser,
  ) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.marketsService.update(id, updateMarketDto, tourOperatorId);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.marketsService.remove(id, tourOperatorId);
  }
}
