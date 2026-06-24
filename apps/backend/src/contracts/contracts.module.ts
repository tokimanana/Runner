import { Module } from '@nestjs/common';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { MealPlanSupplementsController } from './meal-plan-supplements.controller';
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
