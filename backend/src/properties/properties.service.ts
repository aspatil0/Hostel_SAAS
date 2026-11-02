import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role, PropertyStatus, PropertyType, UserStatus } from '../common/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePropertyDto } from './dto/create-property.dto.js';
import { UpdatePropertyDto } from './dto/update-property.dto.js';
import { UpdatePropertyStatusDto } from './dto/update-property-status.dto.js';

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePropertyDto) {
    const propertyType = dto.propertyType || PropertyType.HOSTEL;
    const initialStatus =
      dto.status === 'inactive' || dto.status === PropertyStatus.INACTIVE
        ? PropertyStatus.INACTIVE
        : PropertyStatus.ACTIVE;

    const property = await this.prisma.property.create({
      data: {
        name: dto.name.trim(),
        propertyType,
        address: dto.address ?? '',
        status: initialStatus,
      },
    });

    let assignedUser: any = null;
    const rawOwnerName = dto.ownerName?.trim();
    const rawEmail = dto.ownerEmail?.trim().toLowerCase();
    const fallbackEmail = rawOwnerName
      ? `${rawOwnerName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@hostelos.com`
      : '';
    const adminEmail = rawEmail || fallbackEmail;

    if (adminEmail) {
      try {
        let user = await this.prisma.user.findUnique({
          where: { email: adminEmail },
        });

        if (!user) {
          const rawPassword = dto.portalPassword || 'HostelAdmin@123';
          const passwordHash = await bcrypt.hash(rawPassword, 10);
          user = await this.prisma.user.create({
            data: {
              name: rawOwnerName || 'Property Admin',
              email: adminEmail,
              passwordHash,
              role: Role.PROPERTY_ADMIN,
              status: UserStatus.ACTIVE,
            },
          });
        }

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

        assignedUser = user;
      } catch (err) {
        console.warn('Could not auto-provision property admin user:', err);
      }
    }

    return {
      id: `PROP-${String(property.id).padStart(2, '0')}`,
      rawId: property.id,
      name: property.name,
      address: property.address,
      city: dto.city || 'Mumbai',
      image:
        dto.image ||
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
      ownerName: assignedUser?.name || rawOwnerName || 'Unassigned',
      ownerPhone: dto.ownerPhone || '+91 98201 12345',
      ownerEmail: assignedUser?.email || adminEmail || '',
      totalRooms: Number(dto.totalRooms) || 30,
      totalBeds: Number(dto.totalBeds) || 80,
      occupiedBeds: 0,
      status: property.status.toLowerCase() as 'active' | 'inactive',
      createdAt: property.createdAt.toISOString().split('T')[0],
    };
  }

  async findAll(
    requestingUser: { role: Role; assignedPropertyIds: number[] },
    search?: string,
    status?: PropertyStatus,
  ) {
    const where: any = {};

    // Tenant isolation: PROPERTY_ADMIN can only see their assigned properties
    if (requestingUser.role === Role.PROPERTY_ADMIN) {
      where.id = { in: requestingUser.assignedPropertyIds };
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { address: { contains: search } },
      ];
    }

    const properties = await this.prisma.property.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        propertyUsers: {
          select: {
            id: true,
            role: true,
            user: {
              select: { id: true, name: true, email: true, status: true },
            },
          },
        },
      },
    });

    return properties.map((p: any) => {
      const assignedUser = p.propertyUsers[0]?.user;
      return {
        id: `PROP-${String(p.id).padStart(2, '0')}`,
        rawId: p.id,
        name: p.name,
        address: p.address,
        city: 'Mumbai',
        image:
          'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
        ownerName: assignedUser?.name || 'Unassigned',
        ownerPhone: '+91 98201 12345',
        ownerEmail: assignedUser?.email || '',
        totalRooms: 35,
        totalBeds: 90,
        occupiedBeds: 28,
        status: p.status.toLowerCase() as 'active' | 'inactive',
        createdAt: p.createdAt.toISOString().split('T')[0],
      };
    });
  }

  async findOne(
    id: number,
    requestingUser: { role: Role; assignedPropertyIds: number[] },
  ) {
    // Tenant isolation: PROPERTY_ADMIN can only access assigned properties
    if (
      requestingUser.role === Role.PROPERTY_ADMIN &&
      !requestingUser.assignedPropertyIds.includes(id)
    ) {
      throw new ForbiddenException(
        'You do not have permission to access this property',
      );
    }

    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        propertyUsers: {
          select: {
            id: true,
            role: true,
            user: {
              select: { id: true, name: true, email: true, status: true },
            },
          },
        },
      },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    const assignedUser = property.propertyUsers[0]?.user;

    return {
      id: `PROP-${String(property.id).padStart(2, '0')}`,
      rawId: property.id,
      name: property.name,
      address: property.address,
      city: 'Mumbai',
      image:
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
      ownerName: assignedUser?.name || 'Unassigned',
      ownerPhone: '+91 98201 12345',
      ownerEmail: assignedUser?.email || '',
      totalRooms: 35,
      totalBeds: 90,
      occupiedBeds: 28,
      status: property.status.toLowerCase() as 'active' | 'inactive',
      createdAt: property.createdAt.toISOString().split('T')[0],
    };
  }

  async update(id: number, dto: UpdatePropertyDto) {
    await this.findExistingProperty(id);

    const updated = await this.prisma.property.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.propertyType !== undefined && { propertyType: dto.propertyType }),
        ...(dto.address !== undefined && { address: dto.address }),
      },
    });

    return {
      id: `PROP-${String(updated.id).padStart(2, '0')}`,
      rawId: updated.id,
      name: updated.name,
      address: updated.address,
      status: updated.status.toLowerCase(),
    };
  }

  async updateStatus(id: number, dto: UpdatePropertyStatusDto) {
    await this.findExistingProperty(id);

    const updated = await this.prisma.property.update({
      where: { id },
      data: { status: dto.status },
    });

    return {
      id: `PROP-${String(updated.id).padStart(2, '0')}`,
      rawId: updated.id,
      status: updated.status.toLowerCase(),
      message: `Property status updated to ${dto.status}`,
    };
  }

  async getStatsSummary() {
    const [
      totalProperties,
      activeProperties,
      totalAdmins,
      activeAdmins,
      recentProperties,
      recentAdmins,
    ] = await Promise.all([
      this.prisma.property.count(),
      this.prisma.property.count({ where: { status: PropertyStatus.ACTIVE } }),
      this.prisma.user.count({ where: { role: Role.PROPERTY_ADMIN } }),
      this.prisma.user.count({
        where: { role: Role.PROPERTY_ADMIN, status: UserStatus.ACTIVE },
      }),
      this.prisma.property.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          propertyUsers: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      }),
      this.prisma.user.findMany({
        take: 5,
        where: { role: Role.PROPERTY_ADMIN },
        orderBy: { createdAt: 'desc' },
        include: {
          propertyUsers: {
            include: { property: { select: { id: true, name: true } } },
          },
        },
      }),
    ]);

    return {
      totalProperties,
      activeProperties,
      inactiveProperties: totalProperties - activeProperties,
      totalAdmins,
      activeAdmins,
      inactiveAdmins: totalAdmins - activeAdmins,
      recentProperties: recentProperties.map((p: any) => ({
        id: `PROP-${String(p.id).padStart(2, '0')}`,
        rawId: p.id,
        name: p.name,
        city: 'Mumbai',
        rooms: 35,
        beds: 90,
        admin: p.propertyUsers[0]?.user.name || 'Unassigned',
        status: p.status.toLowerCase(),
      })),
      recentAdmins: recentAdmins.map((a: any) => ({
        id: `ADM-${String(a.id).padStart(2, '0')}`,
        rawId: a.id,
        name: a.name,
        email: a.email,
        property: a.propertyUsers[0]?.property.name || 'Unassigned',
        status: a.status.toLowerCase(),
        joined: a.createdAt.toISOString().split('T')[0],
      })),
    };
  }

  private async findExistingProperty(id: number) {
    const property = await this.prisma.property.findUnique({ where: { id } });
    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }
    return property;
  }
}
