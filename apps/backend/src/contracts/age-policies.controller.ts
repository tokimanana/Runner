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
import { CreateAgePolicyDto } from './dto/create-age-policy.dto';
import { UpdateAgePolicyDto } from './dto/update-age-policy.dto';

@Controller('contracts/:contractId/periods/:periodId/age-policies')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class AgePoliciesController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateAgePolicyDto,
    @Param('contractId') contractId: string,
    @Param('periodId') periodId: string,
  ) {
    return this.contractsService.createAgePolicy(dto, periodId, contractId);
  }

  @Get()
  findByPeriod(
    @Param('contractId') contractId: string,
    @Param('periodId') periodId: string,
  ) {
    return this.contractsService.findAgePoliciesByPeriod(periodId, contractId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAgePolicyDto) {
    return this.contractsService.updateAgePolicy(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.contractsService.removeAgePolicy(id);
  }
}
