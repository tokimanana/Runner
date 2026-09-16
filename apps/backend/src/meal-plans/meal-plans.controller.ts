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
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';
import { MealPlansService } from './meal-plans.service';

@Controller('meal-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class MealPlansController {
  constructor(private readonly mealPlansService: MealPlansService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createMealPlanDto: CreateMealPlanDto,
    @Req() req: RequestWithUser,
  ) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.mealPlansService.create(createMealPlanDto, tourOperatorId);
  }

  @Get()
  findAll(
    @Req() req: RequestWithUser,
    @Query() { limit, offset }: PaginationQuery,
  ) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.mealPlansService.findAll(tourOperatorId, {
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.mealPlansService.findOne(id, tourOperatorId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMealPlanDto: UpdateMealPlanDto,
    @Req() req: RequestWithUser,
  ) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.mealPlansService.update(id, updateMealPlanDto, tourOperatorId);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.mealPlansService.remove(id, tourOperatorId);
  }
}
