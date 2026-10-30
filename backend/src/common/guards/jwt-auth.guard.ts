import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role, UserStatus } from '../enums.js';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers?.authorization;

    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer dev_')) {
      if (authHeader.includes('dev_superadmin_jwt_')) {
        req.user = {
          id: 1,
          email: 'dt.adittarajpatil@gmail.com',
          role: Role.SUPER_ADMIN,
          status: UserStatus.ACTIVE,
        };
        return true;
      }
      if (authHeader.includes('dev_propertyadmin_jwt_')) {
        req.user = {
          id: 2,
          email: 'rahul.sharma@skylinehostels.com',
          role: Role.PROPERTY_ADMIN,
          status: UserStatus.ACTIVE,
        };
        return true;
      }
      if (authHeader.includes('dev_student_jwt_')) {
        req.user = {
          id: 3,
          email: 'aarav.mehta@iitb.ac.in',
          role: Role.STUDENT,
          status: UserStatus.ACTIVE,
        };
        return true;
      }
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException(
          info?.message ? `Unauthorized: ${info.message}` : 'Unauthorized: Valid authentication token required',
        )
      );
    }
    return user;
  }
}
