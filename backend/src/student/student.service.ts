import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { InvoiceStatus, LeaveStatus, ComplaintStatus, ComplaintCategory } from '@prisma/client';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to retrieve student entity linked to logged-in user
   */
  async getStudentByUserId(userId: number) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, email: true, status: true } },
        property: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found for the logged-in user');
    }

    return student;
  }

  /**
   * 1. GET /student/dashboard
   */
  async getDashboard(userId: number) {
    const student = await this.getStudentByUserId(userId);

    const [invoices, payments, leaves, complaints] = await Promise.all([
      this.prisma.feeInvoice.findMany({
        where: { studentId: student.id },
        orderBy: { dueDate: 'asc' },
      }),
      this.prisma.payment.findMany({
        where: { studentId: student.id },
        include: { invoice: true },
        orderBy: { paidAt: 'desc' },
      }),
      this.prisma.leaveApplication.findMany({
        where: { studentId: student.id },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.complaint.findMany({
        where: { studentId: student.id },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const mappedInvoices = invoices.map((inv) => ({
      id: String(inv.id),
      invoiceReference: inv.invoiceNumber,
      feeCategory: inv.category,
      billingPeriod: inv.title,
      dueDate: inv.dueDate.toISOString().split('T')[0],
      totalAmount: Number(inv.amount),
      paidAmount: Number(inv.paidAmount),
      remainingBalance: Math.max(0, Number(inv.amount) - Number(inv.paidAmount)),
      status: inv.status,
      allowPayment: inv.status === InvoiceStatus.UNPAID || inv.status === InvoiceStatus.PARTIALLY_PAID || inv.status === InvoiceStatus.OVERDUE,
    }));

    const mappedPayments = payments.map((p) => ({
      id: String(p.id),
      paymentReference: p.transactionRef,
      invoiceId: String(p.invoiceId),
      invoiceReference: p.invoice.invoiceNumber,
      amount: Number(p.amount),
      paymentDate: p.paidAt.toISOString().split('T')[0],
      paymentMode: 'UPI' as const,
      transactionRef: p.transactionRef,
      status: 'SUCCESS' as const,
    }));

    const mappedLeaves = leaves.map((l) => ({
      id: String(l.id),
      leaveReference: `LEV-${l.id}`,
      startDate: l.startDate.toISOString().split('T')[0],
      endDate: l.endDate.toISOString().split('T')[0],
      numberOfDays: l.totalDays,
      reason: l.reason,
      destination: l.destination || '',
      status: l.status,
      appliedDate: l.createdAt.toISOString().split('T')[0],
      rejectionReason: l.adminRemarks || undefined,
      canCancel: l.status === LeaveStatus.PENDING,
    }));

    const mappedComplaints = complaints.map((c) => ({
      id: String(c.id),
      complaintReference: c.ticketId,
      category: c.category,
      title: c.title,
      description: c.description,
      priority: 'MEDIUM' as const,
      status: c.status,
      submissionDate: c.createdAt.toISOString().split('T')[0],
      resolutionNotes: c.resolution || undefined,
    }));

    const unpaidInvoices = mappedInvoices.filter((i) => i.status === 'UNPAID' || i.status === 'OVERDUE' || i.status === 'PARTIALLY_PAID');
    const outstandingBalance = unpaidInvoices.reduce((sum, i) => sum + i.remainingBalance, 0);
    const nextInvoice = unpaidInvoices[0] || mappedInvoices[0];
    const totalPaidThisSemester = mappedPayments.reduce((sum, p) => sum + p.amount, 0);

    return {
      student: {
        id: String(student.id),
        studentCode: student.studentCode,
        name: student.user.name,
        email: student.user.email,
        phone: student.phone,
        checkInDate: student.admissionDate.toISOString().split('T')[0],
        status: student.status.toLowerCase(),
      },
      accommodation: {
        hostelName: student.property.name,
        building: student.building || 'Block Main',
        floor: student.floor || 1,
        roomNumber: student.roomNumber,
        bedNumber: student.bedNumber,
        roomType: 'Standard Sharing',
        address: student.property.address,
        curfewTime: '10:30 PM',
      },
      financialOverview: {
        outstandingBalance,
        nextDueAmount: nextInvoice ? nextInvoice.remainingBalance : 0,
        nextDueDate: nextInvoice ? nextInvoice.dueDate : 'No pending dues',
        totalPaidThisSemester,
      },
      recentInvoices: mappedInvoices.slice(0, 5),
      recentPayments: mappedPayments.slice(0, 5),
      activeLeaves: mappedLeaves.filter((l) => l.status === 'PENDING' || l.status === 'APPROVED').slice(0, 3),
      recentComplaints: mappedComplaints.slice(0, 5),
      hostelContact: {
        id: student.property.id,
        name: student.property.name,
        address: student.property.address,
        city: 'City Center',
        contactPhone: student.guardianPhone || '+91 98201 12345',
        contactEmail: 'contact@hostelos.local',
        curfewTime: '10:30 PM',
      },
    };
  }

  /**
   * 2. GET /student/profile
   */
  async getProfile(userId: number) {
    const student = await this.getStudentByUserId(userId);

    return {
      id: String(student.id),
      studentCode: student.studentCode,
      name: student.user.name,
      email: student.user.email,
      phone: student.phone,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      guardianRelation: 'Guardian',
      emergencyContact: student.guardianPhone,
      collegeOrCompany: student.collegeOrCompany || 'Resident',
      idProofNumber: student.idProofNumber || 'ID Verified',
      checkInDate: student.admissionDate.toISOString().split('T')[0],
      status: student.status.toLowerCase(),
      roomDetails: {
        roomNumber: student.roomNumber,
        floor: student.floor || 1,
        wing: 'Main Wing',
        building: student.building || 'Block A',
        bedNumber: student.bedNumber,
        roomType: 'Standard Sharing',
        monthlyRent: Number(student.monthlyRent),
        depositAmount: Number(student.depositAmount),
      },
      hostelInfo: {
        id: student.property.id,
        name: student.property.name,
        address: student.property.address,
        city: 'City Center',
        contactPhone: '+91 98201 12345',
        contactEmail: 'contact@hostelos.local',
        emergencyPhone: '+91 98201 00999',
        curfewTime: '10:30 PM',
        wardenName: 'Hostel Administration Office',
        wardenPhone: '+91 98201 55443',
        officeHours: '09:00 AM - 08:00 PM',
      },
    };
  }

  /**
   * 2b. GET /student/contact
   */
  async getContact(userId: number) {
    const profile = await this.getProfile(userId);
    return profile.hostelInfo;
  }

  /**
   * 3. PATCH /student/profile
   */
  async updateProfile(userId: number, body: { phone?: string; emergencyContact?: string }) {
    const student = await this.getStudentByUserId(userId);

    const updated = await this.prisma.student.update({
      where: { id: student.id },
      data: {
        ...(body.phone && { phone: body.phone.trim() }),
        ...(body.emergencyContact && { guardianPhone: body.emergencyContact.trim() }),
      },
    });

    return this.getProfile(userId);
  }

  /**
   * 4. GET /student/fees
   */
  async getFees(userId: number, status?: string) {
    const student = await this.getStudentByUserId(userId);

    const where: any = { studentId: student.id };
    if (status && status !== 'ALL') {
      where.status = status.toUpperCase();
    }

    const invoices = await this.prisma.feeInvoice.findMany({
      where,
      include: {
        payments: { orderBy: { paidAt: 'desc' } },
      },
      orderBy: { dueDate: 'asc' },
    });

    return invoices.map((inv) => ({
      id: String(inv.id),
      invoiceReference: inv.invoiceNumber,
      feeCategory: inv.category,
      billingPeriod: inv.title,
      dueDate: inv.dueDate.toISOString().split('T')[0],
      totalAmount: Number(inv.amount),
      paidAmount: Number(inv.paidAmount),
      remainingBalance: Math.max(0, Number(inv.amount) - Number(inv.paidAmount)),
      status: inv.status,
      allowPayment: inv.status === InvoiceStatus.UNPAID || inv.status === InvoiceStatus.PARTIALLY_PAID || inv.status === InvoiceStatus.OVERDUE,
      paymentHistory: inv.payments.map((p) => ({
        id: String(p.id),
        paymentReference: p.transactionRef,
        invoiceId: String(p.invoiceId),
        invoiceReference: inv.invoiceNumber,
        amount: Number(p.amount),
        paymentDate: p.paidAt.toISOString().split('T')[0],
        paymentMode: 'UPI',
        transactionRef: p.transactionRef,
        status: 'SUCCESS',
      })),
    }));
  }

  /**
   * 5. GET /student/fees/payments
   */
  async getPayments(userId: number) {
    const student = await this.getStudentByUserId(userId);

    const payments = await this.prisma.payment.findMany({
      where: { studentId: student.id },
      include: { invoice: true },
      orderBy: { paidAt: 'desc' },
    });

    return payments.map((p) => ({
      id: String(p.id),
      paymentReference: p.transactionRef,
      invoiceId: String(p.invoiceId),
      invoiceReference: p.invoice.invoiceNumber,
      amount: Number(p.amount),
      paymentDate: p.paidAt.toISOString().split('T')[0],
      paymentMode: 'UPI' as const,
      transactionRef: p.transactionRef,
      status: 'SUCCESS' as const,
    }));
  }

  /**
   * 6. POST /student/fees/pay (Demo Payment Workflow)
   */
  async recordDemoPayment(userId: number, body: { invoiceId: string | number; amount: number; paymentMethod?: string }) {
    const student = await this.getStudentByUserId(userId);
    const invoiceId = Number(body.invoiceId);

    const invoice = await this.prisma.feeInvoice.findFirst({
      where: { id: invoiceId, studentId: student.id },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found for this resident');
    }

    const payAmount = Number(body.amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      throw new BadRequestException('Payment amount must be greater than 0');
    }

    const newPaidAmount = Number(invoice.paidAmount) + payAmount;
    const isFullyPaid = newPaidAmount >= Number(invoice.amount);
    const newStatus = isFullyPaid ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;

    const transactionRef = `DEMO-PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          transactionRef,
          invoiceId: invoice.id,
          studentId: student.id,
          propertyId: student.propertyId,
          amount: payAmount,
          paymentMode: body.paymentMethod || 'DEMO_UPI',
          isDemo: true,
        },
      });

      const updatedInvoice = await tx.feeInvoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: newPaidAmount,
          status: newStatus,
        },
      });

      const receipt = {
        id: String(payment.id),
        paymentReference: payment.transactionRef,
        invoiceId: String(invoice.id),
        invoiceReference: invoice.invoiceNumber,
        amount: Number(payment.amount),
        paymentDate: payment.paidAt.toISOString().split('T')[0],
        paymentMode: 'UPI' as const,
        transactionRef: payment.transactionRef,
        status: 'SUCCESS' as const,
      };

      const mappedInvoice = {
        id: String(updatedInvoice.id),
        invoiceReference: updatedInvoice.invoiceNumber,
        feeCategory: updatedInvoice.category,
        billingPeriod: updatedInvoice.title,
        dueDate: updatedInvoice.dueDate.toISOString().split('T')[0],
        totalAmount: Number(updatedInvoice.amount),
        paidAmount: Number(updatedInvoice.paidAmount),
        remainingBalance: Math.max(0, Number(updatedInvoice.amount) - Number(updatedInvoice.paidAmount)),
        status: updatedInvoice.status,
        allowPayment: updatedInvoice.status !== InvoiceStatus.PAID,
      };

      return {
        success: true,
        message: 'Demo transaction completed successfully! Database invoice status updated.',
        paymentReference: payment.transactionRef,
        transactionRef: payment.transactionRef,
        amount: Number(payment.amount),
        paidDate: payment.paidAt.toISOString().split('T')[0],
        invoice: mappedInvoice,
        receipt,
      };
    });
  }

  /**
   * 7. GET /student/leaves
   */
  async getLeaves(userId: number) {
    const student = await this.getStudentByUserId(userId);

    const leaves = await this.prisma.leaveApplication.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
    });

    return leaves.map((l) => ({
      id: String(l.id),
      leaveReference: `LEV-${l.id}`,
      startDate: l.startDate.toISOString().split('T')[0],
      endDate: l.endDate.toISOString().split('T')[0],
      numberOfDays: l.totalDays,
      reason: l.reason,
      destination: l.destination || '',
      status: l.status,
      appliedDate: l.createdAt.toISOString().split('T')[0],
      rejectionReason: l.adminRemarks || undefined,
      canCancel: l.status === LeaveStatus.PENDING,
    }));
  }

  /**
   * 8. POST /student/leaves
   */
  async applyLeave(userId: number, body: { startDate: string; endDate: string; reason: string; destination?: string }) {
    const student = await this.getStudentByUserId(userId);

    const start = new Date(body.startDate);
    const end = new Date(body.endDate);
    const diffTime = end.getTime() - start.getTime();
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    const created = await this.prisma.leaveApplication.create({
      data: {
        studentId: student.id,
        propertyId: student.propertyId,
        startDate: start,
        endDate: end,
        totalDays: days,
        reason: body.reason.trim(),
        destination: body.destination?.trim() || null,
        status: LeaveStatus.PENDING,
      },
    });

    return {
      id: String(created.id),
      leaveReference: `LEV-${created.id}`,
      startDate: created.startDate.toISOString().split('T')[0],
      endDate: created.endDate.toISOString().split('T')[0],
      numberOfDays: created.totalDays,
      reason: created.reason,
      destination: created.destination || '',
      status: created.status,
      appliedDate: created.createdAt.toISOString().split('T')[0],
      canCancel: true,
    };
  }

  /**
   * 9. DELETE /student/leaves/:id
   */
  async cancelLeave(userId: number, leaveId: string | number) {
    const student = await this.getStudentByUserId(userId);
    const numericId = Number(leaveId);

    const leave = await this.prisma.leaveApplication.findFirst({
      where: { id: numericId, studentId: student.id },
    });

    if (!leave) {
      throw new NotFoundException('Leave application not found');
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Only pending leave applications can be cancelled');
    }

    const updated = await this.prisma.leaveApplication.update({
      where: { id: numericId },
      data: { status: LeaveStatus.CANCELLED },
    });

    return {
      id: String(updated.id),
      leaveReference: `LEV-${updated.id}`,
      startDate: updated.startDate.toISOString().split('T')[0],
      endDate: updated.endDate.toISOString().split('T')[0],
      numberOfDays: updated.totalDays,
      reason: updated.reason,
      destination: updated.destination || '',
      status: updated.status,
      appliedDate: updated.createdAt.toISOString().split('T')[0],
      canCancel: false,
    };
  }

  /**
   * 10. GET /student/complaints
   */
  async getComplaints(userId: number) {
    const student = await this.getStudentByUserId(userId);

    const complaints = await this.prisma.complaint.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
    });

    return complaints.map((c) => ({
      id: String(c.id),
      complaintReference: c.ticketId,
      category: c.category,
      title: c.title,
      description: c.description,
      priority: 'MEDIUM' as const,
      status: c.status,
      submissionDate: c.createdAt.toISOString().split('T')[0],
      resolutionNotes: c.resolution || undefined,
    }));
  }

  /**
   * 11. POST /student/complaints
   */
  async createComplaint(userId: number, body: { category: string; title: string; description: string }) {
    const student = await this.getStudentByUserId(userId);
    const ticketId = `TKT-${Date.now().toString().slice(-4)}`;

    const validCategory = Object.values(ComplaintCategory).includes(body.category.toUpperCase() as any)
      ? (body.category.toUpperCase() as ComplaintCategory)
      : ComplaintCategory.ROOM;

    const created = await this.prisma.complaint.create({
      data: {
        ticketId,
        studentId: student.id,
        propertyId: student.propertyId,
        category: validCategory,
        title: body.title.trim(),
        description: body.description.trim(),
        status: ComplaintStatus.OPEN,
      },
    });

    return {
      id: String(created.id),
      complaintReference: created.ticketId,
      category: created.category,
      title: created.title,
      description: created.description,
      priority: 'MEDIUM' as const,
      status: created.status,
      submissionDate: created.createdAt.toISOString().split('T')[0],
    };
  }
}

