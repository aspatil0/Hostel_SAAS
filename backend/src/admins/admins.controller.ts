import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { CreateAdminDto } from './dto/create-admin.dto.js';
import { AdminsService } from './admins.service.js';

@Controller('admins')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  create(
    @Body() dto: CreateAdminDto,
  ) {
    return this.adminsService.createPropertyAdmin(dto);
  }
}
