import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '@backend/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { User } from "@backend/generated/prisma/client";

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}
    // It's temporary solution, we will add and refresh token service later
    async register(dto: RegisterDto) {
        // Check if the email is already exist in the DB
        const userExists = await this.usersService.findByEmail(dto.email);
        if (userExists) {
            throw new ConflictException('This email is already used');
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(dto.password, 10);

        // Create User
        const user = await this.usersService.create({
            email: dto.email,
            passwordHash,
            firstName: dto.firstName,
            lastName: dto.lastName,
            tourOperatorId: dto.tourOperatorId,
        }) as User;

        return this.generateToken(user);
    }

    async login(dto: LoginDto) {
        // Trying to find the user
        const user = await this.usersService.findByEmail(dto.email) as User | null;
        if (!user) {
            throw new UnauthorizedException("We don't find an account with this email");
        }

        // Check the password
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credential');
        }

        return this.generateToken(user);
    }

    private generateToken(user: Pick<User, 'id' | 'email' | 'role'>) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        };
    }
}