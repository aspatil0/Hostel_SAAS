import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PropertyStatus, Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAdminDto } from './dto/create-admin.dto.js';
import { UpdateAdminDto } from './dto/update-admin.dto.js';
import { UpdateAdminStatusDto } from './dto/update-admin-status.dto.js';

@Injectable()
export class AdminsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPropertyAdmin(dto: CreateAdminDto) {
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
      select: { id: true, name: true, address: true, status: true },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${dto.propertyId} not found`);
    }

    if (property.status !== PropertyStatus.ACTIVE) {
      throw new ConflictException('Cannot assign an administrator to an inactive property');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

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
            select: {
              propertyId: true,
              role: true,
              property: {
                select: { id: true, name: true, address: true, status: true },
              },
            },
          },
        },
      });

      const assignedProp = user.propertyUsers[0]?.property;

      return {
        id: user.id,
        _id: String(user.id),
        name: user.name,
        ownerName: user.name,
        email: user.email,
        phone: dto.phone || '',
        role: user.role,
        status: user.status.toLowerCase(),
        propertyName: assignedProp?.name || 'Unassigned',
        propertyId: assignedProp?.id || null,
        address: assignedProp?.address || '',
        createdAt: user.createdAt,
      };
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

  async findAll(search?: string, status?: UserStatus) {
    const where: Prisma.UserWhereInput = {
      role: Role.PROPERTY_ADMIN,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        {
          propertyUsers: {
            some: {
              property: {
                name: { contains: search },
              },
            },
          },
        },
      ];
    }

    const users = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        propertyUsers: {
          include: {
            property: true,
          },
        },
      },
    });

    return users.map((u) => {
      const assignedProp = u.propertyUsers[0]?.property;
      return {
        id: u.id,
        _id: String(u.id),
        name: u.name,
        ownerName: u.name,
        email: u.email,
        role: u.role,
        status: u.status.toLowerCase(),
        propertyName: assignedProp?.name || 'Unassigned',
        propertyId: assignedProp?.id || null,
        address: assignedProp?.address || '',
        joinedDate: u.createdAt.toISOString().split('T')[0],
        createdAt: u.createdAt,
      };
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        propertyUsers: {
          include: {
            property: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Administrator with ID ${id} not found`);
    }

    const assignedProp = user.propertyUsers[0]?.property;

    return {
      id: user.id,
      _id: String(user.id),
      name: user.name,
      ownerName: user.name,
      email: user.email,
      role: user.role,
      status: user.status.toLowerCase(),
      propertyName: assignedProp?.name || 'Unassigned',
      propertyId: assignedProp?.id || null,
      address: assignedProp?.address || '',
      joinedDate: user.createdAt.toISOString().split('T')[0],
      createdAt: user.createdAt,
      assignedProperties: user.propertyUsers.map((pu) => pu.property),
    };
  }

  async update(id: number, dto: UpdateAdminDto) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Administrator with ID ${id} not found`);
    }

    const updateData: Prisma.UserUpdateInput = {};

    if (dto.name) updateData.name = dto.name.trim();
    if (dto.email) updateData.email = dto.email.trim();
    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    if (dto.propertyId) {
      const property = await this.prisma.property.findUnique({
        where: { id: dto.propertyId },
      });
      if (!property) {
        throw new NotFoundException(`Property with ID ${dto.propertyId} not found`);
      }

      // Reassign property
      await this.prisma.propertyUser.deleteMany({
        where: { userId: id },
      });

      await this.prisma.propertyUser.create({
        data: {
          userId: id,
          propertyId: dto.propertyId,
          role: Role.PROPERTY_ADMIN,
        },
      });
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        propertyUsers: {
          include: { property: true },
        },
      },
    });

    const assignedProp = updated.propertyUsers[0]?.property;

    return {
      id: updated.id,
      _id: String(updated.id),
      name: updated.name,
      ownerName: updated.name,
      email: updated.email,
      role: updated.role,
      status: updated.status.toLowerCase(),
      propertyName: assignedProp?.name || 'Unassigned',
      propertyId: assignedProp?.id || null,
      address: assignedProp?.address || '',
    };
  }

  async updateStatus(id: number, dto: UpdateAdminStatusDto) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Administrator with ID ${id} not found`);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status: dto.status },
    });

    return {
      id: updated.id,
      status: updated.status.toLowerCase(),
      message: `Administrator status updated to ${dto.status}`,
    };
  }

  async remove(id: number) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Administrator with ID ${id} not found`);
    }

    await this.prisma.user.delete({ where: { id } });

    return {
      success: true,
      message: `Administrator with ID ${id} removed successfully`,
    };
  }
}
