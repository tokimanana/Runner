import { Module } from '@nestjs/common';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { ContractRepository } from './repositories/contract.repository';
import { PrismaContractRepository } from './repositories/prisma-contract.repository';

@Module({
  controllers: [ContractsController],
  providers: [
    ContractsService,
    {
      provide: ContractRepository,
      useClass: PrismaContractRepository,
    },
  ],
})
export class ContractsModule {}
