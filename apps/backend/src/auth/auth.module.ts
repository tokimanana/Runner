import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {UsersModule} from "@backend/users/users.module";
import {PassportModule} from "@nestjs/passport";
import {JwtModule} from "@nestjs/jwt";
import {JwtStrategy} from "@backend/auth/jwt.strategy";

@Module({
  imports: [
      UsersModule,
      PassportModule,
      JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: {expiresIn: process.env.JWT_EXPIRATION ?? '1h'},
          })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy]
})
export class AuthModule {}
