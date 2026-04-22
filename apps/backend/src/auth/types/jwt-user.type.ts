import { UserRole } from '@prisma/client';
import { Request } from 'express';

export interface JwtUser {
  id: string;
  email: string;
  role: UserRole;
  tourOperatorId: string;
}

export interface RequestWithUser extends Request {
  user: JwtUser;
}
