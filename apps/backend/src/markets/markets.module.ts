import { Module } from '@nestjs/common';
import { MarketsService } from './markets.service';
import { MarketsController } from './markets.controller';

@Module({
  controllers: [MarketsController],
  providers: [MarketsService],
})
export class MarketsModule {}
