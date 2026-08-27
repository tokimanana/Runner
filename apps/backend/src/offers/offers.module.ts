import { SupplementsModule } from '@backend/supplements/supplements.module';
import { Module } from '@nestjs/common';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { OfferRepository } from './repositories/offer.repository';
import { PrismaOfferRepository } from './repositories/prisma-offer.repository';

@Module({
  imports: [SupplementsModule],
  controllers: [OffersController],
  providers: [
    OffersService,
    { provide: OfferRepository, useClass: PrismaOfferRepository },
  ],
})
export class OffersModule {}
