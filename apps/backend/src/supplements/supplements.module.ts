import { Module } from '@nestjs/common';
import { SupplementsService } from './supplements.service';
import { SupplementsController } from './supplements.controller';

@Module({
  controllers: [SupplementsController],
  providers: [SupplementsService],
})
export class SupplementsModule {}
