import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HotelsModule } from './hotels/hotels.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { SeasonsModule } from './seasons/seasons.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, HotelsModule, SeasonsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
