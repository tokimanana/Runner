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
import { CreateBaseRateDto } from './dto/create-base-rate.dto';
import { UpdateBaseRateDto } from './dto/update-base-rate.dto';

@Controller('contracts/:contractId/periods/:periodId/base-rates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class BaseRatesController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateBaseRateDto,
    @Param('contractId') contractId: string,
    @Param('periodId') periodId: string,
  ) {
    return this.contractsService.createBaseRate(dto, periodId, contractId);
  }

  @Get()
  findByPeriod(
    @Param('contractId') contractId: string,
    @Param('periodId') periodId: string,
  ) {
    return this.contractsService.findBaseRatesByPeriod(periodId, contractId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBaseRateDto) {
    return this.contractsService.updateBaseRate(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.contractsService.removeBaseRate(id);
  }
}
