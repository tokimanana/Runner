import { Module } from '@nestjs/common';
import { CurrenciesController } from './currencies.controller';
import { CurrenciesService } from './currencies.service';
import { CurrencyRepository } from './repositories/currency.repository';
import { PrismaCurrencyRepository } from './repositories/prisma-currency.repository';

@Module({
  controllers: [CurrenciesController],
  providers: [
    CurrenciesService,
    {
      provide: CurrencyRepository,
      useClass: PrismaCurrencyRepository,
    },
  ],
})
export class CurrenciesModule {}
