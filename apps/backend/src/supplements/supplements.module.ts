import { Module } from '@nestjs/common';
import { PrismaSupplementRepository } from './repositories/prisma-supplement.repository';
import { SupplementRepository } from './repositories/supplement.repository';
import { SupplementsController } from './supplements.controller';
import { SupplementsService } from './supplements.service';

@Module({
  controllers: [SupplementsController],
  providers: [
    SupplementsService,
    {
      provide: SupplementRepository,
      useClass: PrismaSupplementRepository,
    },
  ],
})
export class SupplementsModule {}
