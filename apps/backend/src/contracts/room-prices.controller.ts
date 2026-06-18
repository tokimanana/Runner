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
import { UpdateRoomPriceDto } from './dto/update-room-price.dto';

@Controller('room-prices')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class RoomPricesController {
  constructor(private readonly contractsService: ContractsService) {}

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoomPriceDto) {
    return this.contractsService.updateRoomPrice(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.contractsService.removeRoomPrice(id);
  }
}
