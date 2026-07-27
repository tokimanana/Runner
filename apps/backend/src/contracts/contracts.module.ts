import { Module } from '@nestjs/common';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { ContractRepository } from './repositories/contract.repository';
import { PrismaContractRepository } from './repositories/prisma-contract.repository';
import { RoomPricesController } from './room-prices.controller';

@Module({
  controllers: [ContractsController, RoomPricesController],
  providers: [
    ContractsService,
    {
      provide: ContractRepository,
      useClass: PrismaContractRepository,
    },
  ],
})
export class ContractsModule {}
