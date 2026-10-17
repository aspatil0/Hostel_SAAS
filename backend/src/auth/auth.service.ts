import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserStatus } from '../common/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtPayload } from './interfaces/jwt-payload.interface.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: {
        propertyUsers: {
          select: {
            propertyId: true,
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is inactive. Please contact administrator.');
    }

    const assignedProperties = user.propertyUsers.map((pu: any) => pu.propertyId);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      token,
      user: {
        id: user.id,
        _id: String(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        assignedProperties,
      },
    };
  }

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        propertyUsers: {
          select: {
            propertyId: true,
            role: true,
            property: {
              select: {
                id: true,
                name: true,
                propertyType: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User account no longer exists');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User account is inactive. Please contact administrator.');
    }

    return {
      id: user.id,
      _id: String(user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      assignedProperties: user.propertyUsers.map((pu: any) => ({
        propertyId: pu.propertyId,
        role: pu.role,
        propertyName: pu.property.name,
        propertyType: pu.property.propertyType,
        status: pu.property.status,
      })),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async logout(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}
