import { Module } from '@nestjs/common';
import { HotelsController } from './hotels.controller';
import { HotelsService } from './hotels.service';
import { HotelRepository } from './repositories/hotel.repository';
import { PrismaHotelRepository } from './repositories/prisma-hotel.repository';

@Module({
  controllers: [HotelsController],
  providers: [
    HotelsService,
    {
      provide: HotelRepository,
      useClass: PrismaHotelRepository,
    },
  ],
})
export class HotelsModule {}
