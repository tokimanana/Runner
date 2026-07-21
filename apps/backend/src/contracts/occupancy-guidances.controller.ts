import { Roles } from '@backend/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@backend/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@backend/auth/guards/roles.guard';
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
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ContractsService } from './contracts.service';
import { CreateOccupancyGuidanceDto } from './dto/create-occupancy-guidance.dto';
import { UpdateOccupancyGuidanceDto } from './dto/update-occupancy-guidance.dto';

@Controller('occupancy-guidances')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class OccupancyGuidancesController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateOccupancyGuidanceDto) {
    return this.contractsService.createOccupancyGuidance(dto);
  }

  @Get('room-types/:roomTypeId')
  findByRoomType(@Param('roomTypeId') roomTypeId: string) {
    return this.contractsService.findOccupancyGuidanceByRoomType(roomTypeId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOccupancyGuidanceDto) {
    return this.contractsService.updateOccupancyGuidance(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.contractsService.removeOccupancyGuidance(id);
  }
}
