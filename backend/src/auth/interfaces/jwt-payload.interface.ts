import { Role } from '../../common/enums.js';

export interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}
