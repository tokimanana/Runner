import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '@backend/auth/auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from '@backend/auth/dto/login.dto';
import { JwtAuthGuard } from '@backend/auth/guards/jwt-auth.guard';
import { RequestWithUser } from '@backend/auth/types/jwt-user.type';
import { RolesGuard } from '@backend/auth/guards/roles.guard';
import { Roles } from '@backend/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: RequestWithUser) {
    return req.user;
  }

  @Get('admin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getAdminOnly(@Request() req: RequestWithUser) {
    return { message: 'Welcome Admin', user: req.user };
  }
}
