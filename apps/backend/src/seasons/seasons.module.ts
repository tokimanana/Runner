import { Module } from '@nestjs/common';
import { PrismaSeasonRepository } from './repositories/prisma-season.repository';
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
  ],
})
export class SeasonsModule {}
