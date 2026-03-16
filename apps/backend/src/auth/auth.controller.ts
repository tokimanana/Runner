import {Body, Controller, Get, Post, Request, UseGuards} from '@nestjs/common';
import {AuthService} from "@backend/auth/auth.service";
import { RegisterDto } from './dto/register.dto';
import {LoginDto} from "@backend/auth/dto/login.dto";
import {JwtAuthGuard} from "@backend/auth/guards/jwt-auth.guard";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {
    }

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
    getProfile(@Request() req){
        return req.user;
    }
}
