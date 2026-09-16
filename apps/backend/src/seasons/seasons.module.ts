import { Module } from '@nestjs/common';
import { PrismaSeasonPeriodRepository } from './repositories/prisma-season-period.repository';
import { PrismaSeasonRepository } from './repositories/prisma-season.repository';
import { SeasonPeriodRepository } from './repositories/season-period.repository';
import { SeasonRepository } from './repositories/season.repository';
import { SeasonsController } from './seasons.controller';
import { SeasonsService } from './seasons.service';

@Module({
  controllers: [SeasonsController],
  providers: [
    SeasonsService,
    {
      provide: SeasonRepository,
      useClass: PrismaSeasonRepository,
    },
    {
      provide: SeasonPeriodRepository,
      useClass: PrismaSeasonPeriodRepository,
    },
  ],
})
export class SeasonsModule {}
