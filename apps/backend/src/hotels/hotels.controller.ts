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
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { HotelsService } from './hotels.service';

@Controller('hotels')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class HotelController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Post()
  create(@Body() createHotelDto: CreateHotelDto, @Req() req: RequestWithUser) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.hotelsService.create(createHotelDto, tourOperatorId);
  }

  @Get()
  findAll(
    @Req() req: RequestWithUser,
    @Query()
    {
      search,
      limit,
      offset,
    }: { search?: string; limit?: number; offset?: number },
  ) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.hotelsService.findAll(tourOperatorId, {
      search,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.hotelsService.findOne(id, tourOperatorId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateHotelDto: UpdateHotelDto,
    @Req() req: RequestWithUser,
  ) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.hotelsService.update(id, updateHotelDto, tourOperatorId);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.hotelsService.remove(id, tourOperatorId);
  }
}
