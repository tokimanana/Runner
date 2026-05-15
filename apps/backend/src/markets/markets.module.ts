import { Module } from '@nestjs/common';
import { MarketsController } from './markets.controller';
import { MarketsService } from './markets.service';
import { MarketRepository } from './repository/market.repository';
import { PrismaMarketRepository } from './repository/prisma-market.repository';

@Module({
  controllers: [MarketsController],
  providers: [
    MarketsService,
    {
      provide: MarketRepository,
      useClass: PrismaMarketRepository,
    },
  ],
})
export class MarketsModule {}
