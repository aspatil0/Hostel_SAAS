import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StudentService } from './student.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Role } from '../common/enums.js';

@Controller('student')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('dashboard')
  getDashboard(@CurrentUser() user: any) {
    const userId = Number(user.id || user.sub);
    return this.studentService.getDashboard(userId);
  }

  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    const userId = Number(user.id || user.sub);
    return this.studentService.getProfile(userId);
  }

  @Get('contact')
  getContact(@CurrentUser() user: any) {
    const userId = Number(user.id || user.sub);
    return this.studentService.getContact(userId);
  }

  @Patch('profile')
  updateProfile(
    @CurrentUser() user: any,
    @Body() body: { phone?: string; emergencyContact?: string },
  ) {
    const userId = Number(user.id || user.sub);
    return this.studentService.updateProfile(userId, body);
  }

  @Get('fees')
  getFees(
    @CurrentUser() user: any,
    @Query('status') status?: string,
  ) {
    const userId = Number(user.id || user.sub);
    return this.studentService.getFees(userId, status);
  }

  @Get('fees/payments')
  getPayments(@CurrentUser() user: any) {
    const userId = Number(user.id || user.sub);
    return this.studentService.getPayments(userId);
  }

  @Post('fees/pay')
  recordDemoPayment(
    @CurrentUser() user: any,
    @Body() body: { invoiceId: string | number; amount: number; paymentMethod?: string },
  ) {
    const userId = Number(user.id || user.sub);
    return this.studentService.recordDemoPayment(userId, body);
  }

  @Post('fees/demo-pay')
  demoPay(
    @CurrentUser() user: any,
    @Body() body: { invoiceId: string | number; amount: number; paymentMethod?: string },
  ) {
    const userId = Number(user.id || user.sub);
    return this.studentService.recordDemoPayment(userId, body);
  }

  @Get('leaves')
  getLeaves(@CurrentUser() user: any) {
    const userId = Number(user.id || user.sub);
    return this.studentService.getLeaves(userId);
  }

  @Post('leaves')
  applyLeave(
    @CurrentUser() user: any,
    @Body() body: { startDate: string; endDate: string; reason: string; destination?: string },
  ) {
    const userId = Number(user.id || user.sub);
    return this.studentService.applyLeave(userId, body);
  }

  @Patch('leaves/:id/cancel')
  cancelLeavePatch(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    const userId = Number(user.id || user.sub);
    return this.studentService.cancelLeave(userId, id);
  }

  @Delete('leaves/:id')
  cancelLeave(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    const userId = Number(user.id || user.sub);
    return this.studentService.cancelLeave(userId, id);
  }

  @Get('complaints')
  getComplaints(@CurrentUser() user: any) {
    const userId = Number(user.id || user.sub);
    return this.studentService.getComplaints(userId);
  }

  @Post('complaints')
  createComplaint(
    @CurrentUser() user: any,
    @Body() body: { category: string; title: string; description: string },
  ) {
    const userId = Number(user.id || user.sub);
    return this.studentService.createComplaint(userId, body);
  }
}
