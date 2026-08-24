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
import { Offer, PaginatedResult } from '@runner/shared/types';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PaginationQuery } from '../common/pagination.types';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { OffersService } from './offers.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createOfferDto: CreateOfferDto,
    @Req() req: RequestWithUser,
  ): Promise<Offer> {
    const tourOperatorId = req.user.tourOperatorId;
    return this.offersService.create(createOfferDto, tourOperatorId);
  }

  @Get()
  findAll(
    @Query() { limit, offset }: PaginationQuery,
    @Req() req: RequestWithUser,
  ): Promise<PaginatedResult<Offer>> {
    const tourOperatorId = req.user.tourOperatorId;
    return this.offersService.findAll(tourOperatorId, { limit, offset });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<Offer> {
    const tourOperatorId = req.user.tourOperatorId;
    return this.offersService.findOne(id, tourOperatorId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOfferDto: UpdateOfferDto,
    @Req() req: RequestWithUser,
  ): Promise<Offer> {
    const tourOperatorId = req.user.tourOperatorId;
    return this.offersService.update(id, updateOfferDto, tourOperatorId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Req() req: RequestWithUser): Promise<void> {
    const tourOperatorId = req.user.tourOperatorId;
    return this.offersService.remove(id, tourOperatorId);
  }
}
