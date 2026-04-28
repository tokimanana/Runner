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
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CreateAgeCategoryDto } from './dto/create-age-category.dto';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateAgeCategoryDto } from './dto/update-age-category.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';
import { HOTELS_SERVICE } from './hotels.constants';
import { IHotelsService } from './hotels.service.interface';

@Controller('hotels')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class HotelsController {
  constructor(
    @Inject(HOTELS_SERVICE)
    private readonly hotelsService: IHotelsService,
  ) {}

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

  @Get(':id/age-categories')
  findAllAgeCategories(@Param('id') id: string, @Req() req: RequestWithUser) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.hotelsService.findAllAgeCategories(tourOperatorId, id);
  }

  @Post(':id/age-categories')
  createAgeCategory(
    @Body() createAgeCategoryDto: CreateAgeCategoryDto,
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.hotelsService.createAgeCategory(
      createAgeCategoryDto,
      tourOperatorId,
      id,
    );
  }

  @Patch(':id/age-categories/:catId')
  updateAgeCategory(
    @Param('id') id: string,
    @Body() updateAgeCategoryDto: UpdateAgeCategoryDto,
    @Req() req: RequestWithUser,
    @Param('catId') catId: string,
  ) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.hotelsService.updateAgeCategory(
      catId,
      updateAgeCategoryDto,
      tourOperatorId,
      id,
    );
  }

  @Delete(':id/age-categories/:catId')
  @HttpCode(204)
  removeAgeCategory(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Param('catId') catId: string,
  ) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.hotelsService.removeAgeCategory(catId, tourOperatorId, id);
  }

  @Get(':id/room-types')
  findAllRoomTypes(@Param('id') id: string, @Req() req: RequestWithUser) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.hotelsService.findAllRoomTypes(tourOperatorId, id);
  }

  @Post(':id/room-types')
  createRoomType(
    @Body() createRoomTypeDto: CreateRoomTypeDto,
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.hotelsService.createRoomType(
      createRoomTypeDto,
      tourOperatorId,
      id,
    );
  }

  @Patch(':id/room-types/:typeId')
  updateRoomType(
    @Param('id') id: string,
    @Body() updateRoomTypeDto: UpdateRoomTypeDto,
    @Req() req: RequestWithUser,
    @Param('typeId') typeId: string,
  ) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.hotelsService.updateRoomType(
      typeId,
      updateRoomTypeDto,
      tourOperatorId,
      id,
    );
  }

  @Delete(':id/room-types/:typeId')
  @HttpCode(204)
  removeRoomType(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Param('typeId') typeId: string,
  ) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.hotelsService.removeRoomType(typeId, tourOperatorId, id);
  }
}
