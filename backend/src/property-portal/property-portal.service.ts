import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { CreateInvoiceDto } from './dto/create-invoice.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';
import { RecordPaymentDto } from './dto/record-payment.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { AllocateRoomDto } from './dto/allocate-room.dto.js';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { Role, UserStatus, StudentStatus, InvoiceStatus, FeeCategory } from '@prisma/client';

export interface StudentRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  guardianName: string;
  guardianPhone: string;
  collegeOrCompany: string;
  roomNumber: string;
  bedNumber: string;
  monthlyRent: number;
  depositAmount: number;
  checkInDate: string;
  status: 'active' | 'checked_out';
  idProofNumber: string;
  propertyId: number;
}

export interface RentRecordItem {
  id: string;
  studentId: string;
  studentName: string;
  roomNumber: string;
  month: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue';
  paymentMode?: 'UPI' | 'Cash' | 'NetBanking';
  transactionRef?: string;
  propertyId: number;
}

export interface RoomNode {
  roomNumber: string;
  floor: number;
  wing: 'East' | 'West';
  type: string;
  price: number;
  propertyId: number;
  beds: Array<{
    bedId: string;
    bedName: string;
    status: 'occupied' | 'vacant' | 'maintenance';
    student?: {
      name: string;
      phone: string;
      college: string;
      checkInDate: string;
      rent: number;
    };
  }>;
}

@Injectable()
export class PropertyPortalService {
  private dataFilePath: string;
  private students: StudentRecord[] = [];
  private rentRecords: RentRecordItem[] = [];
  private rooms: RoomNode[] = [];
  private profileStore: Record<number, any> = {};

  constructor(private readonly prisma: PrismaService) {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch {
        // Ignored if cannot create
      }
    }
    this.dataFilePath = path.join(dataDir, 'portal_store.json');
    this.loadStore();
  }

  private loadStore() {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const raw = fs.readFileSync(this.dataFilePath, 'utf8');
        const parsed = JSON.parse(raw);
        this.students = parsed.students || [];
        this.rentRecords = parsed.rentRecords || [];
        this.rooms = parsed.rooms || [];
        this.profileStore = parsed.profileStore || {};
        return;
      }
    } catch (e) {
      console.warn('Could not read portal_store.json, initializing defaults:', e);
    }
    this.initDefaults();
  }

  private saveStore() {
    try {
      fs.writeFileSync(
        this.dataFilePath,
        JSON.stringify(
          {
            students: this.students,
            rentRecords: this.rentRecords,
            rooms: this.rooms,
            profileStore: this.profileStore,
          },
          null,
          2,
        ),
        'utf8',
      );
    } catch (e) {
      console.warn('Could not persist portal_store.json:', e);
    }
  }

  private initDefaults() {
    // 2 Clean Initial Students
    this.students = [
      {
        id: 'STU-01',
        name: 'Aarav Mehta',
        phone: '+91 98111 22334',
        email: 'aarav.mehta@gmail.com',
        guardianName: 'Sanjay Mehta',
        guardianPhone: '+91 98111 99887',
        collegeOrCompany: 'IIT Bombay (CSE)',
        roomNumber: '101',
        bedNumber: 'Bed A',
        monthlyRent: 12500,
        depositAmount: 25000,
        checkInDate: '2026-07-15',
        status: 'active',
        idProofNumber: 'Aadhar Verified (XXXX-8921)',
        propertyId: 1,
      },
      {
        id: 'STU-02',
        name: 'Rohan Deshmukh',
        phone: '+91 98222 33445',
        email: 'rohan.deshmukh@gmail.com',
        guardianName: 'Prakash Deshmukh',
        guardianPhone: '+91 98222 88776',
        collegeOrCompany: 'VJTI Mumbai (IT)',
        roomNumber: '102',
        bedNumber: 'Bed A',
        monthlyRent: 14000,
        depositAmount: 28000,
        checkInDate: '2026-08-01',
        status: 'active',
        idProofNumber: 'Passport Verified (PXXXX902)',
        propertyId: 1,
      },
    ];

    this.rentRecords = [
      {
        id: 'RENT-2026-10-01',
        studentId: 'STU-01',
        studentName: 'Aarav Mehta',
        roomNumber: '101',
        month: 'October 2026',
        amount: 12500,
        paidAmount: 12500,
        dueDate: '2026-10-05',
        paidDate: '2026-10-03',
        status: 'paid',
        paymentMode: 'UPI',
        transactionRef: 'UPI-AXIS-982341204',
        propertyId: 1,
      },
      {
        id: 'RENT-2026-10-02',
        studentId: 'STU-02',
        studentName: 'Rohan Deshmukh',
        roomNumber: '102',
        month: 'October 2026',
        amount: 14000,
        paidAmount: 0,
        dueDate: '2026-10-05',
        status: 'pending',
        propertyId: 1,
      },
    ];

    this.rooms = [
      {
        roomNumber: '101',
        floor: 1,
        wing: 'East',
        type: 'Double Sharing AC',
        price: 12500,
        propertyId: 1,
        beds: [
          {
            bedId: '101-A',
            bedName: 'Bed A',
            status: 'occupied',
            student: {
              name: 'Aarav Mehta',
              phone: '+91 98111 22334',
              college: 'IIT Bombay (CSE)',
              checkInDate: '2026-07-15',
              rent: 12500,
            },
          },
          {
            bedId: '101-B',
            bedName: 'Bed B',
            status: 'vacant',
          },
        ],
      },
      {
        roomNumber: '102',
        floor: 1,
        wing: 'East',
        type: 'Double Sharing AC',
        price: 14000,
        propertyId: 1,
        beds: [
          {
            bedId: '102-A',
            bedName: 'Bed A',
            status: 'occupied',
            student: {
              name: 'Rohan Deshmukh',
              phone: '+91 98222 33445',
              college: 'VJTI Mumbai (IT)',
              checkInDate: '2026-08-01',
              rent: 14000,
            },
          },
          {
            bedId: '102-B',
            bedName: 'Bed B',
            status: 'vacant',
          },
        ],
      },
    ];

    this.profileStore[1] = {
      hostelData: {
        name: 'Grand Skyline Premier Hostel',
        tagline: 'Premium Student & Executive PG Accommodation',
        address: 'Opp. University North Gate, Powai Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400076',
        contactPhone: '+91 98201 12345',
        contactEmail: 'contact@grandskyline.com',
        totalRooms: 45,
        totalBeds: 120,
        curfewTime: '10:30 PM',
        messBreakfast: '07:30 AM - 09:30 AM',
        messDinner: '08:00 PM - 10:00 PM',
      },
      managerData: {
        name: 'Rahul Sharma',
        role: 'Authorized Property Manager',
        phone: '+91 98201 12345',
        email: 'rahul.sharma@skylinehostels.com',
        emergencyPhone: '+91 98201 00999',
      },
      amenities: {
        wifi: true,
        meals: true,
        roWater: true,
        biometric: true,
        ac: true,
        powerBackup: true,
        housekeeping: true,
        cctv: true,
        laundry: true,
        studyRoom: true,
      },
    };

    this.saveStore();
  }

  private resolvePropertyId(user: any, requestedId?: number): number {
    if (requestedId && !isNaN(Number(requestedId))) {
      return Number(requestedId);
    }
    if (user?.assignedPropertyIds && user.assignedPropertyIds.length > 0) {
      return user.assignedPropertyIds[0];
    }
    return 1;
  }

  async getDashboard(user: any, propertyId?: number) {
    const propId = this.resolvePropertyId(user, propertyId);
    const students = this.students.filter((s) => s.propertyId === propId);
    const rentRecords = this.rentRecords.filter((r) => r.propertyId === propId);

    // Calculate Occupancy Metrics
    const totalBeds = 120;
    const activeStudentsCount = students.filter((s) => s.status === 'active').length;
    const occupiedBeds = activeStudentsCount > 0 ? activeStudentsCount : 2;
    const vacantBeds = totalBeds - occupiedBeds;
    const occupancyPercentage = Math.round((occupiedBeds / totalBeds) * 100);

    // Calculate Rent Metrics
    const totalMonthlyBilled = rentRecords.reduce((sum, r) => sum + r.amount, 0);
    const collectedRent = rentRecords
      .filter((r) => r.status === 'paid')
      .reduce((sum, r) => sum + r.paidAmount, 0);
    const pendingRent = totalMonthlyBilled - collectedRent;

    return {
      propertyId: propId,
      propertyName: this.profileStore[propId]?.hostelData?.name || 'Grand Skyline Premier Hostel',
      occupancy: {
        totalBeds,
        occupiedBeds,
        vacantBeds,
        occupancyPercentage,
      },
      financials: {
        totalMonthlyBilled,
        collectedRent,
        pendingRent,
      },
      recentStudents: students.slice(0, 5),
      recentRentRecords: rentRecords.slice(0, 5),
    };
  }

  async getStudents(user: any, search?: string, status?: string, propertyId?: number) {
    const propId = this.resolvePropertyId(user, propertyId);

    // Build Prisma query condition with property tenant isolation
    const whereCondition: any = {
      propertyId: propId,
    };

    if (status && status !== 'all') {
      whereCondition.status = status.toUpperCase() === 'ACTIVE' ? 'ACTIVE' : 'CHECKED_OUT';
    }

    if (search && search.trim()) {
      const q = search.trim();
      whereCondition.OR = [
        { user: { name: { contains: q } } },
        { phone: { contains: q } },
        { roomNumber: { contains: q } },
        { collegeOrCompany: { contains: q } },
        { studentCode: { contains: q } },
      ];
    }

    const dbStudents = await this.prisma.student.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (dbStudents.length > 0) {
      return dbStudents.map((s) => ({
        id: s.studentCode,
        dbId: s.id,
        name: s.user?.name || '',
        phone: s.phone,
        email: s.user?.email || '',
        guardianName: s.guardianName,
        guardianPhone: s.guardianPhone,
        collegeOrCompany: s.collegeOrCompany || '',
        roomNumber: s.roomNumber,
        bedNumber: s.bedNumber,
        monthlyRent: Number(s.monthlyRent),
        depositAmount: Number(s.depositAmount),
        checkInDate: s.admissionDate.toISOString().split('T')[0],
        status: (s.status.toLowerCase() as 'active' | 'checked_out'),
        idProofNumber: s.idProofNumber || 'Aadhar Verified',
        propertyId: s.propertyId,
      }));
    }

    // Fallback to in-memory store if DB has not been seeded yet
    let list = this.students.filter((s) => s.propertyId === propId);
    if (status && status !== 'all') {
      list = list.filter((s) => s.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.phone.includes(q) ||
          s.roomNumber.toLowerCase().includes(q) ||
          s.collegeOrCompany.toLowerCase().includes(q),
      );
    }
    return list;
  }

  async getStudentById(user: any, id: string | number) {
    const propId = this.resolvePropertyId(user);
    const numericId = typeof id === 'number' ? id : parseInt(id, 10);

    const student = await this.prisma.student.findFirst({
      where: {
        propertyId: propId,
        OR: [
          ...(isNaN(numericId) ? [] : [{ id: numericId }]),
          { studentCode: String(id) },
        ],
      },
      include: {
        user: { select: { id: true, name: true, email: true, status: true } },
        invoices: { orderBy: { createdAt: 'desc' } },
        payments: { orderBy: { paidAt: 'desc' } },
        leaves: { orderBy: { createdAt: 'desc' } },
        complaints: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student ${id} not found in this property`);
    }

    return student;
  }

  async updateStudent(user: any, id: string | number, dto: UpdateStudentDto) {
    const propId = this.resolvePropertyId(user);
    const numericId = typeof id === 'number' ? id : parseInt(id, 10);

    const existing = await this.prisma.student.findFirst({
      where: {
        propertyId: propId,
        OR: [
          ...(isNaN(numericId) ? [] : [{ id: numericId }]),
          { studentCode: String(id) },
        ],
      },
    });

    if (!existing) {
      throw new NotFoundException(`Student ${id} not found`);
    }

    return await this.prisma.$transaction(async (tx) => {
      if (dto.name) {
        await tx.user.update({
          where: { id: existing.userId },
          data: { name: dto.name.trim() },
        });
      }

      return await tx.student.update({
        where: { id: existing.id },
        data: {
          ...(dto.phone && { phone: dto.phone.trim() }),
          ...(dto.guardianName && { guardianName: dto.guardianName.trim() }),
          ...(dto.guardianPhone && { guardianPhone: dto.guardianPhone.trim() }),
          ...(dto.collegeOrCompany && { collegeOrCompany: dto.collegeOrCompany.trim() }),
          ...(dto.roomNumber && { roomNumber: dto.roomNumber }),
          ...(dto.bedNumber && { bedNumber: dto.bedNumber }),
          ...(dto.monthlyRent !== undefined && { monthlyRent: dto.monthlyRent }),
          ...(dto.depositAmount !== undefined && { depositAmount: dto.depositAmount }),
          ...(dto.status && { status: dto.status as StudentStatus }),
        },
      });
    });
  }

  async getInvoices(user: any, status?: string, studentId?: number, propertyId?: number) {
    const propId = this.resolvePropertyId(user, propertyId);
    const where: any = { propertyId: propId };

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (studentId) {
      where.studentId = Number(studentId);
    }

    return await this.prisma.feeInvoice.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createInvoice(user: any, dto: CreateInvoiceDto) {
    const propId = this.resolvePropertyId(user);

    // Verify student exists and belongs to this property
    const student = await this.prisma.student.findFirst({
      where: { id: Number(dto.studentId), propertyId: propId },
      include: { user: true },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${dto.studentId} does not exist in this property`);
    }

    const now = new Date();
    const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;

    return await this.prisma.feeInvoice.create({
      data: {
        invoiceNumber,
        studentId: student.id,
        propertyId: propId,
        category: (dto.category as FeeCategory) || FeeCategory.RENT,
        title: dto.title.trim(),
        amount: Number(dto.amount),
        paidAmount: 0,
        dueDate: new Date(dto.dueDate),
        status: InvoiceStatus.UNPAID,
      },
      include: {
        student: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    });
  }

  async createStudent(user: any, dto: CreateStudentDto) {
    const propId = this.resolvePropertyId(user, dto.propertyId);

    const studentEmail =
      dto.email?.trim().toLowerCase() ||
      `${dto.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}.${Date.now().toString().slice(-4)}@student.hostel.com`;

    // Check for duplicate user email
    const existingUser = await this.prisma.user.findUnique({
      where: { email: studentEmail },
    });
    if (existingUser) {
      throw new ConflictException(`A user with email ${studentEmail} already exists`);
    }

    const studentCode = `STU-${Date.now().toString().slice(-4)}`;
    const defaultPassword = 'Student@2026';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const userRecord = await tx.user.create({
        data: {
          name: dto.name.trim(),
          email: studentEmail,
          passwordHash,
          role: Role.STUDENT,
          status: UserStatus.ACTIVE,
        },
      });

      const student = await tx.student.create({
        data: {
          studentCode,
          userId: userRecord.id,
          propertyId: propId,
          phone: dto.phone.trim(),
          guardianName: dto.guardianName?.trim() || 'Parent / Guardian',
          guardianPhone: dto.guardianPhone?.trim() || dto.phone.trim(),
          collegeOrCompany: dto.collegeOrCompany?.trim() || 'Institution / Company',
          roomNumber: dto.roomNumber,
          bedNumber: dto.bedNumber,
          monthlyRent: Number(dto.monthlyRent) || 0,
          depositAmount: Number(dto.depositAmount) || 0,
          status: 'ACTIVE',
        },
      });

      const now = new Date();
      const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${student.id}`;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 5);

      if (Number(dto.monthlyRent) > 0) {
        await tx.feeInvoice.create({
          data: {
            invoiceNumber,
            studentId: student.id,
            propertyId: propId,
            category: 'RENT',
            title: `Hostel Rent - ${now.toLocaleString('en-US', { month: 'long', year: 'numeric' })}`,
            amount: Number(dto.monthlyRent),
            paidAmount: 0,
            dueDate,
            status: 'UNPAID',
          },
        });
      }

      return {
        id: student.studentCode,
        dbId: student.id,
        name: userRecord.name,
        email: userRecord.email,
        phone: student.phone,
        guardianName: student.guardianName,
        guardianPhone: student.guardianPhone,
        collegeOrCompany: student.collegeOrCompany || '',
        roomNumber: student.roomNumber,
        bedNumber: student.bedNumber,
        monthlyRent: Number(student.monthlyRent),
        depositAmount: Number(student.depositAmount),
        checkInDate: student.admissionDate.toISOString().split('T')[0],
        status: 'active' as const,
        idProofNumber: student.idProofNumber || 'Aadhar Verified',
        propertyId: student.propertyId,
        credentials: {
          email: userRecord.email,
          tempPassword: defaultPassword,
        },
      };
    });

    return result;
  }

  async checkoutStudent(user: any, id: string) {
    const propId = this.resolvePropertyId(user);
    const student = this.students.find((s) => s.id === id && s.propertyId === propId);

    if (!student) {
      throw new NotFoundException(`Student ${id} not found`);
    }

    student.status = 'checked_out';

    // Free bed in room matrix
    const room = this.rooms.find((r) => r.propertyId === propId && r.roomNumber === student.roomNumber);
    if (room) {
      const bed = room.beds.find((b) => b.bedName === student.bedNumber || b.bedId.endsWith(student.bedNumber));
      if (bed) {
        bed.status = 'vacant';
        delete bed.student;
      }
    }

    this.saveStore();
    return { success: true, message: `Resident ${student.name} marked as checked out` };
  }

  async getRentRecords(user: any, search?: string, status?: string, month?: string, propertyId?: number) {
    const propId = this.resolvePropertyId(user, propertyId);
    let list = this.rentRecords.filter((r) => r.propertyId === propId);

    if (status && status !== 'all') {
      list = list.filter((r) => r.status === status);
    }

    if (month && month !== 'all') {
      list = list.filter((r) => r.month.toLowerCase().includes(month.toLowerCase()));
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) => r.studentName.toLowerCase().includes(q) || r.roomNumber.toLowerCase().includes(q),
      );
    }

    return list;
  }

  async recordPayment(user: any, dto: RecordPaymentDto) {
    const propId = this.resolvePropertyId(user, dto.propertyId);
    const existing = this.rentRecords.find(
      (r) => r.studentId === dto.studentId && r.propertyId === propId,
    );

    const student = this.students.find((s) => s.id === dto.studentId && s.propertyId === propId);

    if (existing) {
      existing.paidAmount = Math.min(existing.amount, existing.paidAmount + dto.amount);
      existing.status = existing.paidAmount >= existing.amount ? 'paid' : 'pending';
      existing.paidDate = dto.paymentDate || new Date().toISOString().split('T')[0];
      existing.paymentMode = (dto.paymentMode as any) || 'UPI';
      existing.transactionRef = dto.transactionRef || `TXN-${Date.now().toString().slice(-6)}`;
      this.saveStore();
      return existing;
    }

    const newRecord: RentRecordItem = {
      id: `RENT-${Date.now().toString().slice(-6)}`,
      studentId: dto.studentId,
      studentName: student?.name || 'Resident',
      roomNumber: student?.roomNumber || '101',
      month: dto.month || 'October 2026',
      amount: dto.amount,
      paidAmount: dto.amount,
      dueDate: new Date().toISOString().split('T')[0],
      paidDate: dto.paymentDate || new Date().toISOString().split('T')[0],
      status: 'paid',
      paymentMode: (dto.paymentMode as any) || 'UPI',
      transactionRef: dto.transactionRef || `TXN-${Date.now().toString().slice(-6)}`,
      propertyId: propId,
    };

    this.rentRecords.unshift(newRecord);
    this.saveStore();
    return newRecord;
  }

  async getRooms(user: any, propertyId?: number) {
    const propId = this.resolvePropertyId(user, propertyId);
    return this.rooms.filter((r) => r.propertyId === propId);
  }

  async allocateRoom(user: any, dto: AllocateRoomDto) {
    const propId = this.resolvePropertyId(user, dto.propertyId);
    let room = this.rooms.find((r) => r.propertyId === propId && r.roomNumber === dto.roomNumber);

    if (!room) {
      room = {
        roomNumber: dto.roomNumber,
        floor: 1,
        wing: 'East',
        type: 'Double Sharing AC',
        price: 12500,
        propertyId: propId,
        beds: [
          {
            bedId: `${dto.roomNumber}-A`,
            bedName: 'Bed A',
            status: 'vacant',
          },
          {
            bedId: `${dto.roomNumber}-B`,
            bedName: 'Bed B',
            status: 'vacant',
          },
        ],
      };
      this.rooms.push(room);
    }

    const bed = room.beds.find((b) => b.bedId === dto.bedId || b.bedName === dto.bedId);
    if (bed) {
      bed.status = dto.status;
      if (dto.student && dto.status === 'occupied') {
        bed.student = {
          name: dto.student.name,
          phone: dto.student.phone,
          college: dto.student.college || 'College / Company',
          checkInDate: dto.student.checkInDate || new Date().toISOString().split('T')[0],
          rent: dto.student.rent || room.price,
        };
      } else if (dto.status !== 'occupied') {
        delete bed.student;
      }
    }

    this.saveStore();
    return room;
  }

  async getProfile(user: any, propertyId?: number) {
    const propId = this.resolvePropertyId(user, propertyId);
    let profile = this.profileStore[propId];

    if (!profile) {
      profile = {
        hostelData: {
          name: 'Grand Skyline Premier Hostel',
          tagline: 'Premium Student & Executive PG Accommodation',
          address: 'Opp. University North Gate, Powai Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400076',
          contactPhone: '+91 98201 12345',
          contactEmail: 'contact@grandskyline.com',
          totalRooms: 45,
          totalBeds: 120,
          curfewTime: '10:30 PM',
          messBreakfast: '07:30 AM - 09:30 AM',
          messDinner: '08:00 PM - 10:00 PM',
        },
        managerData: {
          name: user?.name || 'Rahul Sharma',
          role: 'Authorized Property Manager',
          phone: '+91 98201 12345',
          email: user?.email || 'rahul.sharma@skylinehostels.com',
          emergencyPhone: '+91 98201 00999',
        },
        amenities: {
          wifi: true,
          meals: true,
          roWater: true,
          biometric: true,
          ac: true,
          powerBackup: true,
          housekeeping: true,
          cctv: true,
          laundry: true,
          studyRoom: true,
        },
      };
      this.profileStore[propId] = profile;
    }

    return profile;
  }

  async updateProfile(user: any, dto: UpdateProfileDto) {
    const propId = this.resolvePropertyId(user, dto.propertyId);
    const existing = await this.getProfile(user, propId);

    if (dto.hostelData) {
      existing.hostelData = { ...existing.hostelData, ...dto.hostelData };
      // Sync name and address back to Prisma property if exists
      try {
        await this.prisma.property.update({
          where: { id: propId },
          data: {
            ...(dto.hostelData.name && { name: dto.hostelData.name }),
            ...(dto.hostelData.address && { address: dto.hostelData.address }),
          },
        });
      } catch {
        // Ignored if property record not found
      }
    }

    if (dto.managerData) {
      existing.managerData = { ...existing.managerData, ...dto.managerData };
    }

    if (dto.amenities) {
      existing.amenities = { ...existing.amenities, ...dto.amenities };
    }

    this.profileStore[propId] = existing;
    this.saveStore();

    return {
      success: true,
      message: 'Property details and amenities updated successfully',
      profile: existing,
    };
  }
}
