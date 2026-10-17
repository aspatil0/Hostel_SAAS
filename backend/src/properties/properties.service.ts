import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Role, PropertyStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePropertyDto } from './dto/create-property.dto.js';
import { UpdatePropertyDto } from './dto/update-property.dto.js';
import { UpdatePropertyStatusDto } from './dto/update-property-status.dto.js';

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePropertyDto) {
    const property = await this.prisma.property.create({
      data: {
        name: dto.name,
        propertyType: dto.propertyType,
        address: dto.address ?? '',
      },
    });
    return property;
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

    return properties;
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

    return property;
  }

  async update(id: number, dto: UpdatePropertyDto) {
    await this.findExistingProperty(id);

    return this.prisma.property.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.propertyType !== undefined && { propertyType: dto.propertyType }),
        ...(dto.address !== undefined && { address: dto.address }),
      },
    });
  }

  async updateStatus(id: number, dto: UpdatePropertyStatusDto) {
    await this.findExistingProperty(id);

    return this.prisma.property.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  private async findExistingProperty(id: number) {
    const property = await this.prisma.property.findUnique({ where: { id } });
    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }
    return property;
  }
}
