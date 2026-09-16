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
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ContractsService } from './contracts.service';
import { ContractQuery } from './contracts.types';
import { CreateContractPeriodDto } from './dto/create-contract-period.dto';
import { CreateContractDto } from './dto/create-contract.dto';
import { CreateMealPlanSupplementDto } from './dto/create-meal-plan-supplement.dto';
import { CreateRoomPriceDto } from './dto/create-room-price.dto';
import { CreateStopSalesDateDto } from './dto/create-stop-sales-date.dto';
import { UpdateContractPeriodDto } from './dto/update-contract-period.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createContractDto: CreateContractDto,
    @Req() req: RequestWithUser,
  ) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.contractsService.create(createContractDto, tourOperatorId);
  }

  @Get()
  findAll(
    @Req() req: RequestWithUser,
    @Query() { limit, offset, hotelId, marketId }: ContractQuery,
  ) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.contractsService.findAll(tourOperatorId, {
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      hotelId,
      marketId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.contractsService.findOne(id, tourOperatorId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateContractDto: UpdateContractDto,
    @Req() req: RequestWithUser,
  ) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.contractsService.update(id, updateContractDto, tourOperatorId);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.contractsService.remove(id, tourOperatorId);
  }

  @Post(':id/periods')
  @HttpCode(HttpStatus.CREATED)
  createPeriod(
    @Param('id') contractId: string,
    @Body() dto: CreateContractPeriodDto,
  ) {
    return this.contractsService.createPeriod(dto, contractId);
  }

  @Patch(':id/periods/:periodId')
  updatePeriod(
    @Param('id') contractId: string,
    @Body() dto: UpdateContractPeriodDto,
    @Param('periodId') periodId: string,
  ) {
    return this.contractsService.updatePeriod(periodId, dto, contractId);
  }

  @Delete(':id/periods/:periodId')
  @HttpCode(204)
  deletePeriod(
    @Param('id') contractId: string,
    @Param('periodId') periodId: string,
  ) {
    return this.contractsService.removePeriod(periodId, contractId);
  }

  @Post(':id/periods/:periodId/room-prices')
  @HttpCode(HttpStatus.CREATED)
  createRoomPrice(
    @Param('id') contractId: string,
    @Param('periodId') periodId: string,
    @Body() dto: CreateRoomPriceDto,
  ) {
    return this.contractsService.createRoomPrice(dto, periodId, contractId);
  }

  @Post(':id/periods/:periodId/meal-supplements')
  @HttpCode(HttpStatus.CREATED)
  createMealPlanSupplement(
    @Param('id') contractId: string,
    @Param('periodId') periodId: string,
    @Body() dto: CreateMealPlanSupplementDto,
  ) {
    return this.contractsService.createMealPlanSupplement(
      dto,
      periodId,
      contractId,
    );
  }

  @Post(':id/periods/:periodId/stop-sales')
  @HttpCode(HttpStatus.CREATED)
  createStopSalesDate(
    @Param('id') contractId: string,
    @Param('periodId') contractPeriodId: string,
    @Body() dto: CreateStopSalesDateDto,
  ) {
    return this.contractsService.createStopSalesDate(
      dto,
      contractPeriodId,
      contractId,
    );
  }
}
