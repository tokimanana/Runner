import { Module } from '@nestjs/common';
import { HOTEL_REPOSITORY } from './hotels.constants';
import { HotelsController } from './hotels.controller';
import { HotelsService } from './hotels.service';
import { PrismaHotelRepository } from './repositories/prisma-hotel.repository';

@Module({
  controllers: [HotelsController],
  providers: [
    HotelsService,
    {
      provide: HOTEL_REPOSITORY,
      useClass: PrismaHotelRepository,
    },
  ],
})
export class HotelsModule {}
