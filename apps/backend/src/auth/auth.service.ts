import { UserResponseType, UsersService } from '@backend/users/users.service';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type AuthTokens = {
  access_token: string;
  refresh_token: string;
};

type LoginResponse = {
  tokens: AuthTokens;
  user: UserResponseType;
};

type RefreshResponse = {
  access_token: string;
  user: UserResponseType;
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ user: UserResponseType }> {
    const userExists = await this.usersService.findByEmail(dto.email);
    if (userExists) {
      throw new ConflictException('This email is already used');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      tourOperatorId: dto.tourOperatorId,
    });

    // create() retourne l'objet Prisma complet — on filtre passwordHash
    return { user: this.toUserPayload(user) };
  }

  async login(dto: LoginDto): Promise<LoginResponse> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildLoginResponse(user);
  }

  async refreshAccessToken(refreshToken: string): Promise<RefreshResponse> {
    try {
      const payload = this.jwtService.verify<{
        sub: string;
        email: string;
        role: UserRole;
        type: string;
      }>(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        access_token: this.signAccessToken(user),
        user,
      };
    } catch (err) {
      if (
        err instanceof TokenExpiredError ||
        err instanceof JsonWebTokenError
      ) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }
      throw err;
    }
  }

  private buildLoginResponse(
    user: UserResponseType & { passwordHash: string },
  ): LoginResponse {
    return {
      tokens: {
        access_token: this.signAccessToken(user),
        refresh_token: this.signRefreshToken(user),
      },
      user: this.toUserPayload(user),
    };
  }

  private signAccessToken(user: UserResponseType): string {
    return this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        tourOperatorId: user.tourOperatorId,
        type: 'access',
      },
      { secret: process.env.JWT_SECRET, expiresIn: '60m' },
    );
  }

  private signRefreshToken(user: UserResponseType): string {
    return this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role, type: 'refresh' },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '24h' },
    );
  }

  private toUserPayload(
    user: UserResponseType & { passwordHash?: string },
  ): UserResponseType {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      tourOperatorId: user.tourOperatorId,
    };
  }
}
