import { Module } from '@nestjs/common';
import { HOTELS_SERVICE } from './hotels.constants';
import { HotelsController } from './hotels.controller';
import { HotelsService } from './hotels.service';
import { HotelRepository } from './repositories/hotel.repository';
import { PrismaHotelRepository } from './repositories/prisma-hotel.repository';

@Module({
  controllers: [HotelsController],
  providers: [
    {
      provide: HOTELS_SERVICE,
      useClass: HotelsService,
    },
    {
      provide: HotelRepository,
      useClass: PrismaHotelRepository,
    },
  ],
})
export class HotelsModule {}