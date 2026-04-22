import { AuthService } from '@backend/auth/auth.service';
import { Roles } from '@backend/auth/decorators/roles.decorator';
import { LoginDto } from '@backend/auth/dto/login.dto';
import { JwtAuthGuard } from '@backend/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@backend/auth/guards/roles.guard';
import { RequestWithUser } from '@backend/auth/types/jwt-user.type';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Request, Response } from 'express';
import { RegisterDto } from './dto/register.dto';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { tokens, user } = await this.authService.login(dto);
    this.setTokenCookies(res, tokens.access_token, tokens.refresh_token);
    return { user };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = (req.cookies as Record<string, string | undefined>)[
      'refresh_token'
    ];
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }

    const { access_token, user } =
      await this.authService.refreshAccessToken(refreshToken);

    res.cookie('access_token', access_token, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 1000,
    });

    return { user };
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', COOKIE_OPTIONS);
    res.clearCookie('refresh_token', COOKIE_OPTIONS);
    return { success: true };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: RequestWithUser) {
    return req.user;
  }

  @Get('admin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getAdminOnly(@Req() req: RequestWithUser) {
    return { message: 'Welcome Admin', user: req.user };
  }

  private setTokenCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    res.cookie('access_token', accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 1000, // 60 min
    });
    res.cookie('refresh_token', refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 24 * 60 * 60 * 1000, // 24h
    });
  }
}
