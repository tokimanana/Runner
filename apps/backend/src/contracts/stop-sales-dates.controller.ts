import { Roles } from '@backend/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@backend/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@backend/auth/guards/roles.guard';
import { Controller, Delete, HttpCode, Param, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ContractsService } from './contracts.service';

@Controller('stop-sales')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class StopSalesDatesController {
  constructor(private readonly contractsService: ContractsService) {}

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.contractsService.removeStopSalesDate(id);
  }
}
