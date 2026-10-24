import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PropertyStatus, Role, UserStatus } from '../common/enums.js';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAdminDto } from './dto/create-admin.dto.js';
import { UpdateAdminDto } from './dto/update-admin.dto.js';
import { UpdateAdminStatusDto } from './dto/update-admin-status.dto.js';

@Injectable()
export class AdminsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPropertyAdmin(dto: CreateAdminDto) {
    let property: any = null;

    if (dto.propertyId) {
      property = await this.prisma.property.findUnique({
        where: { id: dto.propertyId },
        select: { id: true, name: true, address: true, status: true },
      });
    }

    if (!property && dto.propertyName) {
      property = await this.prisma.property.findFirst({
        where: { name: dto.propertyName.trim() },
        select: { id: true, name: true, address: true, status: true },
      });

      if (!property) {
        property = await this.prisma.property.create({
          data: {
            name: dto.propertyName.trim(),
            address: dto.address || 'Campus Location',
            propertyType: 'HOSTEL',
            status: PropertyStatus.ACTIVE,
          },
          select: { id: true, name: true, address: true, status: true },
        });
      }
    }

    if (!property) {
      property = await this.prisma.property.findFirst({
        select: { id: true, name: true, address: true, status: true },
      });
      if (!property) {
        property = await this.prisma.property.create({
          data: {
            name: dto.propertyName || 'Grand Skyline Premier Hostel',
            address: dto.address || 'Opp. University Gate, Mumbai',
            propertyType: 'HOSTEL',
            status: PropertyStatus.ACTIVE,
          },
          select: { id: true, name: true, address: true, status: true },
        });
      }
    }

    const rawPassword = dto.password || dto.portalPassword || 'HostelAdmin@123';
    const passwordHash = await bcrypt.hash(rawPassword, 10);
    const email = dto.email.trim().toLowerCase();

    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      let user: any;

      if (existingUser) {
        user = await this.prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: dto.name.trim(),
            passwordHash,
            status: UserStatus.ACTIVE,
          },
          include: {
            propertyUsers: {
              include: {
                property: true,
              },
            },
          },
        });

        // Ensure link to property exists
        if (property) {
          await this.prisma.propertyUser.upsert({
            where: {
              unique_user_property_assignment: {
                userId: user.id,
                propertyId: property.id,
              },
            },
            update: { role: Role.PROPERTY_ADMIN },
            create: {
              userId: user.id,
              propertyId: property.id,
              role: Role.PROPERTY_ADMIN,
            },
          });
        }
      } else {
        user = await this.prisma.user.create({
          data: {
            name: dto.name.trim(),
            email,
            passwordHash,
            role: Role.PROPERTY_ADMIN,
            status: UserStatus.ACTIVE,
            ...(property && {
              propertyUsers: {
                create: {
                  propertyId: property.id,
                  role: Role.PROPERTY_ADMIN,
                },
              },
            }),
          },
          include: {
            propertyUsers: {
              include: {
                property: true,
              },
            },
          },
        });
      }

      const assignedProp = user.propertyUsers?.[0]?.property || property;

      return {
        id: user.id,
        _id: String(user.id),
        name: user.name,
        ownerName: user.name,
        email: user.email,
        phone: dto.phone || '+91 98201 12345',
        role: user.role,
        status: user.status.toLowerCase(),
        propertyName: assignedProp?.name || dto.propertyName || 'Assigned Property',
        propertyId: assignedProp?.id || property?.id || 1,
        address: assignedProp?.address || dto.address || '',
        city: dto.city || 'Mumbai',
        portalPassword: rawPassword,
        joinedDate: new Date().toISOString().split('T')[0],
      };
    } catch (err: any) {
      throw new ConflictException(err?.message || 'Failed to provision property admin');
    }
  }

  async findAll(search?: string, status?: UserStatus) {
    const where: any = {
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

    return users.map((u: any) => {
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
      assignedProperties: user.propertyUsers.map((pu: any) => pu.property),
    };
  }

  async update(id: number, dto: UpdateAdminDto) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Administrator with ID ${id} not found`);
    }

    const updateData: any = {};

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
