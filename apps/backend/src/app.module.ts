import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HotelsModule } from './hotels/hotels.module';
import { MealPlansModule } from './meal-plans/meal-plans.module';
import { PrismaModule } from './prisma/prisma.module';
import { SeasonsModule } from './seasons/seasons.module';
import { UsersModule } from './users/users.module';
import { MarketsModule } from './markets/markets.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    HotelsModule,
    SeasonsModule,
    MealPlansModule,
    MarketsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
