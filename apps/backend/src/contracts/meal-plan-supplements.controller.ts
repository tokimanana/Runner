import { Roles } from '@backend/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@backend/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@backend/auth/guards/roles.guard';
import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ContractsService } from './contracts.service';
import { UpdateMealPlanSupplementDto } from './dto/update-meal-plan-supplement.dto';

@Controller('meal-supplements')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class MealPlanSupplementsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Patch(':id')
  updateMealPlanSupplement(
    @Param('id') id: string,
    @Body() dto: UpdateMealPlanSupplementDto,
  ) {
    return this.contractsService.updateMealPlanSupplement(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  removeMealPlanSupplement(@Param('id') id: string) {
    return this.contractsService.removeMealPlanSupplement(id);
  }
}
