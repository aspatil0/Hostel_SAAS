import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}
