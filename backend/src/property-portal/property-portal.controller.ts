import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '../common/enums.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import {
  PropertyPortalService,
  StudentRecord,
  RentRecordItem,
  RoomNode,
} from './property-portal.service.js';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { RecordPaymentDto } from './dto/record-payment.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { AllocateRoomDto } from './dto/allocate-room.dto.js';

@Controller('property-portal')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PropertyPortalController {
  constructor(private readonly portalService: PropertyPortalService) {}

  @Get('dashboard')
  @Roles(Role.PROPERTY_ADMIN, Role.SUPER_ADMIN)
  getDashboard(
    @CurrentUser() user: any,
    @Query('propertyId') propertyId?: number,
  ): Promise<any> {
    return this.portalService.getDashboard(user, propertyId);
  }

  @Get('students')
  @Roles(Role.PROPERTY_ADMIN, Role.SUPER_ADMIN)
  getStudents(
    @CurrentUser() user: any,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('propertyId') propertyId?: number,
  ): Promise<StudentRecord[]> {
    return this.portalService.getStudents(user, search, status, propertyId);
  }

  @Post('students')
  @Roles(Role.PROPERTY_ADMIN, Role.SUPER_ADMIN)
  createStudent(
    @CurrentUser() user: any,
    @Body() dto: CreateStudentDto,
  ): Promise<StudentRecord> {
    return this.portalService.createStudent(user, dto);
  }

  @Patch('students/:id/checkout')
  @Roles(Role.PROPERTY_ADMIN, Role.SUPER_ADMIN)
  checkoutStudent(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ): Promise<any> {
    return this.portalService.checkoutStudent(user, id);
  }

  @Get('rent')
  @Roles(Role.PROPERTY_ADMIN, Role.SUPER_ADMIN)
  getRentRecords(
    @CurrentUser() user: any,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('month') month?: string,
    @Query('propertyId') propertyId?: number,
  ): Promise<RentRecordItem[]> {
    return this.portalService.getRentRecords(user, search, status, month, propertyId);
  }

  @Post('rent/record')
  @Roles(Role.PROPERTY_ADMIN, Role.SUPER_ADMIN)
  recordPayment(
    @CurrentUser() user: any,
    @Body() dto: RecordPaymentDto,
  ): Promise<RentRecordItem> {
    return this.portalService.recordPayment(user, dto);
  }

  @Get('rooms')
  @Roles(Role.PROPERTY_ADMIN, Role.SUPER_ADMIN)
  getRooms(
    @CurrentUser() user: any,
    @Query('propertyId') propertyId?: number,
  ): Promise<RoomNode[]> {
    return this.portalService.getRooms(user, propertyId);
  }

  @Post('rooms/allocate')
  @Roles(Role.PROPERTY_ADMIN, Role.SUPER_ADMIN)
  allocateRoom(
    @CurrentUser() user: any,
    @Body() dto: AllocateRoomDto,
  ): Promise<RoomNode> {
    return this.portalService.allocateRoom(user, dto);
  }

  @Get('profile')
  @Roles(Role.PROPERTY_ADMIN, Role.SUPER_ADMIN)
  getProfile(
    @CurrentUser() user: any,
    @Query('propertyId') propertyId?: number,
  ): Promise<any> {
    return this.portalService.getProfile(user, propertyId);
  }

  @Patch('profile')
  @Roles(Role.PROPERTY_ADMIN, Role.SUPER_ADMIN)
  updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateProfileDto,
  ): Promise<any> {
    return this.portalService.updateProfile(user, dto);
  }
}
