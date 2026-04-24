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
import { CreateAgeCategoryDto } from './dto/create-age-category.dto';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateAgeCategoryDto } from './dto/update-age-category.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { HotelsService } from './hotels.service';

@Controller('hotels')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class HotelsController {
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

  // GET    /hotels/:id/age-categories
  @Get(':id/age-categories')
  findAllAgeCategories(@Param('id') id: string, @Req() req: RequestWithUser) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.hotelsService.findAllAgeCategories(tourOperatorId, id);
  }

  // POST   /hotels/:id/age-categories
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

  // PATCH    /hotels/:id/age-categories/:catId
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

  // DELETE /hotels/:id/age-categories/:catId
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
}
