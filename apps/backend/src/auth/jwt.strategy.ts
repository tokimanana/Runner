import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UserRole } from '@prisma/client';
import { Request } from 'express';
import {
  JwtFromRequestFunction,
  Strategy,
  StrategyOptionsWithoutRequest,
} from 'passport-jwt';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  type: string;
}

const extractFromCookie: JwtFromRequestFunction = (
  req: Request,
): string | null => {
  const cookies = req?.cookies as
    | Record<string, string | undefined>
    | undefined;
  return cookies?.['access_token'] ?? null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-custom') {
  constructor() {
    super({
      jwtFromRequest: extractFromCookie,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    } satisfies StrategyOptionsWithoutRequest);
  }

  validate(payload: JwtPayload) {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
