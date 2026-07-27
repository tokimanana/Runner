import { Module } from '@nestjs/common';
import { AgePoliciesController } from './age-policies.controller';
import { BaseRatesController } from './base-rates.controller';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { MealPlanSupplementsController } from './meal-plan-supplements.controller';
import { OccupancyGuidancesController } from './occupancy-guidances.controller';
import { ContractRepository } from './repositories/contract.repository';
import { PrismaContractRepository } from './repositories/prisma-contract.repository';
import { RoomPricesController } from './room-prices.controller';
import { StopSalesDatesController } from './stop-sales-dates.controller';

@Module({
  controllers: [
    ContractsController,
    RoomPricesController,
    MealPlanSupplementsController,
    StopSalesDatesController,
    BaseRatesController,
    AgePoliciesController,
    OccupancyGuidancesController,
  ],
  providers: [
    ContractsService,
    {
      provide: ContractRepository,
      useClass: PrismaContractRepository,
    },
  ],
})
export class ContractsModule {}
