import { UserRole } from '@backend/generated/prisma/enums';
import { Request } from 'express';

export interface JwtUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface RequestWithUser extends Request {
  user: JwtUser;
}
