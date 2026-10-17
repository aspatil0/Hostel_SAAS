import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PropertyStatus, Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAdminDto } from './dto/create-admin.dto.js';

@Injectable()
export class AdminsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPropertyAdmin(dto: CreateAdminDto) {
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
      select: { id: true, status: true },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${dto.propertyId} not found`);
    }

    if (property.status !== PropertyStatus.ACTIVE) {
      throw new ConflictException('Cannot assign an administrator to an inactive property');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    try {
      const user = await this.prisma.user.create({
        data: {
          name: dto.name.trim(),
          email: dto.email,
          passwordHash,
          role: Role.PROPERTY_ADMIN,
          status: UserStatus.ACTIVE,
          propertyUsers: {
            create: {
              propertyId: dto.propertyId,
              role: Role.PROPERTY_ADMIN,
            },
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          propertyUsers: {
            select: { propertyId: true, role: true },
          },
        },
      });

      const { propertyUsers, ...admin } = user;
      return { ...admin, assignedProperties: propertyUsers };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('A user with this email already exists');
      }
      throw error;
    }
  }
}
