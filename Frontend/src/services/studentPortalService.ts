import { apiClient } from './apiClient';
import type {
  StudentDashboardSummary,
  StudentProfile,
  StudentFeeInvoice,
  PaymentReceipt,
  DemoPaymentRequest,
  DemoPaymentResponse,
  LeaveApplication,
  ApplyLeaveDto,
  Complaint,
  CreateComplaintDto,
  StudentHostelInfo,
  InvoiceStatus,
} from '../types/student';

// Storage keys for offline mock persistence during development
const STORAGE_KEYS = {
  INVOICES: 'hostelos_student_mock_invoices',
  PAYMENTS: 'hostelos_student_mock_payments',
  LEAVES: 'hostelos_student_mock_leaves',
  COMPLAINTS: 'hostelos_student_mock_complaints',
  PROFILE: 'hostelos_student_mock_profile',
};

// ==========================================
// DEFAULT LABELED MOCK DATA (TEMPORARY FALLBACK)
// ==========================================

const DEFAULT_HOSTEL_INFO: StudentHostelInfo = {
  id: 1,
  name: 'Grand Skyline Premier Hostel',
  tagline: 'Premium Student & Executive Accommodation',
  address: 'Opp. University North Gate, Powai Road',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400076',
  contactPhone: '+91 98201 12345',
  contactEmail: 'contact@grandskyline.com',
  emergencyPhone: '+91 98201 00999',
  curfewTime: '10:30 PM',
  messTimings: {
    breakfast: '07:30 AM - 09:30 AM',
    lunch: '12:30 PM - 02:30 PM',
    dinner: '08:00 PM - 10:00 PM',
  },
  wardenName: 'Dr. Suresh Nair',
  wardenPhone: '+91 98201 55443',
  managerEmail: 'warden@grandskyline.com',
  officeHours: '09:00 AM - 08:00 PM (Mon - Sat)',
};

const DEFAULT_PROFILE: StudentProfile = {
  id: 'STU-101',
  studentCode: 'HOS-2026-0891',
  name: 'Aarav Mehta',
  email: 'aarav.mehta@iitb.ac.in',
  phone: '+91 98111 22334',
  guardianName: 'Rajesh Mehta',
  guardianPhone: '+91 98111 00112',
  guardianRelation: 'Father',
  emergencyContact: '+91 98111 99887 (Uncle)',
  collegeOrCompany: 'IIT Bombay (CSE - 3rd Year)',
  idProofNumber: 'Aadhar Verified (XXXX-XXXX-4892)',
  checkInDate: '2026-07-15',
  status: 'active',
  roomDetails: {
    roomNumber: '101',
    floor: 1,
    wing: 'East Wing',
    building: 'Block Alpha',
    bedNumber: 'Bed A',
    roomType: 'Double Sharing AC',
    monthlyRent: 12500,
    depositAmount: 25000,
  },
  hostelInfo: DEFAULT_HOSTEL_INFO,
};

const DEFAULT_INVOICES: StudentFeeInvoice[] = [
  {
    id: 'INV-2026-11-01',
    invoiceReference: 'INV-NOV-2026',
    feeCategory: 'RENT',
    billingPeriod: 'November 2026',
    dueDate: '2026-11-05',
    totalAmount: 12500,
    paidAmount: 0,
    remainingBalance: 12500,
    status: 'UNPAID',
    allowPayment: true,
  },
  {
    id: 'INV-2026-11-02',
    invoiceReference: 'INV-MESS-NOV',
    feeCategory: 'MESS',
    billingPeriod: 'November 2026',
    dueDate: '2026-11-07',
    totalAmount: 4500,
    paidAmount: 0,
    remainingBalance: 4500,
    status: 'UPCOMING' as any,
    allowPayment: true,
  },
  {
    id: 'INV-2026-10-01',
    invoiceReference: 'INV-OCT-2026',
    feeCategory: 'RENT',
    billingPeriod: 'October 2026',
    dueDate: '2026-10-05',
    totalAmount: 12500,
    paidAmount: 12500,
    remainingBalance: 0,
    status: 'PAID',
    allowPayment: false,
    paymentHistory: [
      {
        id: 'RCPT-1029',
        paymentReference: 'PAY-OCT-8821',
        invoiceId: 'INV-2026-10-01',
        invoiceReference: 'INV-OCT-2026',
        amount: 12500,
        paymentDate: '2026-10-03',
        paymentMode: 'UPI',
        transactionRef: 'UPI-TXN-9988221',
        status: 'SUCCESS',
      },
    ],
  },
  {
    id: 'INV-2026-09-01',
    invoiceReference: 'INV-SEP-2026',
    feeCategory: 'RENT',
    billingPeriod: 'September 2026',
    dueDate: '2026-09-05',
    totalAmount: 12500,
    paidAmount: 12500,
    remainingBalance: 0,
    status: 'PAID',
    allowPayment: false,
  },
  {
    id: 'INV-2026-07-00',
    invoiceReference: 'INV-DEP-2026',
    feeCategory: 'DEPOSIT',
    billingPeriod: 'One-Time Security Deposit',
    dueDate: '2026-07-15',
    totalAmount: 25000,
    paidAmount: 25000,
    remainingBalance: 0,
    status: 'PAID',
    allowPayment: false,
  },
];

const DEFAULT_PAYMENTS: PaymentReceipt[] = [
  {
    id: 'RCPT-1029',
    paymentReference: 'PAY-OCT-8821',
    invoiceId: 'INV-2026-10-01',
    invoiceReference: 'INV-OCT-2026',
    amount: 12500,
    paymentDate: '2026-10-03',
    paymentMode: 'UPI',
    transactionRef: 'UPI-TXN-9988221',
    status: 'SUCCESS',
  },
  {
    id: 'RCPT-1015',
    paymentReference: 'PAY-SEP-7731',
    invoiceId: 'INV-2026-09-01',
    invoiceReference: 'INV-SEP-2026',
    amount: 12500,
    paymentDate: '2026-09-02',
    paymentMode: 'NetBanking',
    transactionRef: 'HDFC-TXN-4422110',
    status: 'SUCCESS',
  },
  {
    id: 'RCPT-1001',
    paymentReference: 'PAY-DEP-1102',
    invoiceId: 'INV-2026-07-00',
    invoiceReference: 'INV-DEP-2026',
    amount: 25000,
    paymentDate: '2026-07-15',
    paymentMode: 'NetBanking',
    transactionRef: 'ICICI-DEP-883311',
    status: 'SUCCESS',
  },
];

const DEFAULT_LEAVES: LeaveApplication[] = [
  {
    id: 'LEV-01',
    leaveReference: 'LEV-2026-10-04',
    startDate: '2026-11-01',
    endDate: '2026-11-04',
    numberOfDays: 4,
    reason: 'Diwali Festival celebration with family',
    destination: 'Pune, Maharashtra',
    contactDetails: '+91 98111 22334',
    emergencyContact: '+91 98111 00112',
    status: 'APPROVED',
    appliedDate: '2026-10-24',
    approvedBy: 'Dr. Suresh Nair (Warden)',
    decisionDate: '2026-10-25',
    canCancel: false,
  },
  {
    id: 'LEV-02',
    leaveReference: 'LEV-2026-10-18',
    startDate: '2026-11-14',
    endDate: '2026-11-16',
    numberOfDays: 3,
    reason: 'Attending college technical symposium hackathon',
    destination: 'Bengaluru Campus',
    contactDetails: '+91 98111 22334',
    status: 'PENDING',
    appliedDate: '2026-10-27',
    canCancel: true,
  },
];

const DEFAULT_COMPLAINTS: Complaint[] = [
  {
    id: 'CMP-01',
    complaintReference: 'CMP-ROOM-081',
    category: 'Wi-Fi',
    title: 'Intermittent Wi-Fi signal drop on 1st Floor East Wing',
    description: 'The router AP outside room 101 drops connection every 20 minutes during study hours.',
    priority: 'HIGH',
    status: 'RESOLVED',
    submissionDate: '2026-10-20',
    resolutionNotes: 'Access point rebooted and 5GHz channel firmware updated by IT technician.',
    resolvedAt: '2026-10-21',
    assignedStaff: 'Ramesh (Network Engg)',
  },
  {
    id: 'CMP-02',
    complaintReference: 'CMP-PLUMB-094',
    category: 'Plumbing',
    title: 'Hot water faucet pressure is low in bathroom',
    description: 'The geyser pressure valve appears slightly clogged in room 101 attached bath.',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    submissionDate: '2026-10-27',
    resolutionNotes: 'Plumber inspected; replacement aerator part ordered for fitting tomorrow.',
    assignedStaff: 'Mahesh (Maintenance)',
  },
];

// Helper: load from localStorage with fallback
function loadMock<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(`[StudentService] Mock storage read error for ${key}:`, e);
  }
  return fallback;
}

// Helper: save to localStorage
function saveMock<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`[StudentService] Mock storage write error for ${key}:`, e);
  }
}

// ==========================================
// STUDENT PORTAL SERVICE (PHASE 2)
// ==========================================

export const studentPortalService = {
  /**
   * Fetch home dashboard overview
   */
  async getDashboard(): Promise<StudentDashboardSummary> {
    try {
      const live = await apiClient.get<StudentDashboardSummary>('/student/dashboard');
      if (live && live.student) return live;
    } catch {
      // Live backend endpoint not provisioned yet by Utkarsh; proceed with typed mock fallback
    }

    const profile = await this.getProfile();
    const invoices = await this.getInvoices();
    const payments = await this.getPaymentHistory();
    const leaves = await this.getLeaves();
    const complaints = await this.getComplaints();

    const unpaidInvoices = invoices.filter((i) => i.status === 'UNPAID' || i.status === 'OVERDUE');
    const outstandingBalance = unpaidInvoices.reduce((sum, i) => sum + i.remainingBalance, 0);

    const nextInvoice = unpaidInvoices[0] || invoices[0];
    const totalPaidThisSemester = payments
      .filter((p) => p.status === 'SUCCESS')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      student: {
        id: profile.id,
        studentCode: profile.studentCode,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        checkInDate: profile.checkInDate,
        status: profile.status,
      },
      accommodation: {
        hostelName: profile.hostelInfo.name,
        building: profile.roomDetails.building || 'Block Alpha',
        floor: profile.roomDetails.floor,
        roomNumber: profile.roomDetails.roomNumber,
        bedNumber: profile.roomDetails.bedNumber,
        roomType: profile.roomDetails.roomType,
        address: profile.hostelInfo.address,
        curfewTime: profile.hostelInfo.curfewTime || '10:30 PM',
      },
      financialOverview: {
        outstandingBalance,
        nextDueAmount: nextInvoice ? nextInvoice.remainingBalance : 0,
        nextDueDate: nextInvoice ? nextInvoice.dueDate : 'No pending dues',
        totalPaidThisSemester,
      },
      recentInvoices: invoices.slice(0, 3),
      recentPayments: payments.slice(0, 3),
      activeLeaves: leaves.filter((l) => l.status === 'PENDING' || l.status === 'APPROVED').slice(0, 3),
      recentComplaints: complaints.slice(0, 3),
      hostelContact: profile.hostelInfo,
    };
  },

  /**
   * Fetch student profile
   */
  async getProfile(): Promise<StudentProfile> {
    try {
      const live = await apiClient.get<StudentProfile>('/student/profile');
      if (live && live.name) return live;
    } catch {
      // Live endpoint offline
    }
    return loadMock<StudentProfile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
  },

  /**
   * Update student profile (editable fields only: phone, emergencyContact)
   */
  async updateProfile(updates: Partial<Pick<StudentProfile, 'phone' | 'emergencyContact'>>): Promise<StudentProfile> {
    try {
      const live = await apiClient.patch<StudentProfile>('/student/profile', updates);
      if (live && live.name) return live;
    } catch {
      // Fallback
    }

    const current = await this.getProfile();
    const updated: StudentProfile = {
      ...current,
      ...updates,
    };
    saveMock(STORAGE_KEYS.PROFILE, updated);
    return updated;
  },

  /**
   * Fetch student fee invoices
   */
  async getInvoices(statusFilter?: InvoiceStatus | 'ALL'): Promise<StudentFeeInvoice[]> {
    try {
      const query = statusFilter && statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
      const live = await apiClient.get<StudentFeeInvoice[]>(`/student/fees${query}`);
      if (Array.isArray(live)) return live;
    } catch {
      // Fallback
    }

    const invoices = loadMock<StudentFeeInvoice[]>(STORAGE_KEYS.INVOICES, DEFAULT_INVOICES);
    if (!statusFilter || statusFilter === 'ALL') {
      return invoices;
    }
    return invoices.filter((i) => i.status === statusFilter);
  },

  /**
   * Fetch payment history receipts
   */
  async getPaymentHistory(): Promise<PaymentReceipt[]> {
    try {
      const live = await apiClient.get<PaymentReceipt[]>('/student/fees/payments');
      if (Array.isArray(live)) return live;
    } catch {
      // Fallback
    }
    return loadMock<PaymentReceipt[]>(STORAGE_KEYS.PAYMENTS, DEFAULT_PAYMENTS);
  },

  /**
   * Process a DEMO payment (Demo-mode only, determines success and updates invoice)
   */
  async processDemoPayment(payload: DemoPaymentRequest): Promise<DemoPaymentResponse> {
    try {
      const live = await apiClient.post<DemoPaymentResponse>('/student/fees/demo-pay', payload);
      if (live && live.success) return live;
    } catch {
      // Fallback: simulate backend demo payment processing
    }

    // Simulate server network latency (600ms)
    await new Promise((resolve) => setTimeout(resolve, 600));

    const invoices = loadMock<StudentFeeInvoice[]>(STORAGE_KEYS.INVOICES, DEFAULT_INVOICES);
    const payments = loadMock<PaymentReceipt[]>(STORAGE_KEYS.PAYMENTS, DEFAULT_PAYMENTS);

    const invoiceIndex = invoices.findIndex((i) => i.id === payload.invoiceId);
    if (invoiceIndex === -1) {
      throw new Error(`Invoice ${payload.invoiceReference} not found`);
    }

    const targetInvoice = invoices[invoiceIndex];
    const newPaidAmount = targetInvoice.paidAmount + payload.amount;
    const newRemaining = Math.max(0, targetInvoice.totalAmount - newPaidAmount);
    const newStatus: InvoiceStatus = newRemaining === 0 ? 'PAID' : 'PARTIALLY_PAID';

    const paymentRef = `PAY-DEMO-${Date.now().toString().slice(-6)}`;
    const txnRef = `UPI-DEMO-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const today = new Date().toISOString().split('T')[0];

    const newReceipt: PaymentReceipt = {
      id: `RCPT-${Date.now().toString().slice(-6)}`,
      paymentReference: paymentRef,
      invoiceId: targetInvoice.id,
      invoiceReference: targetInvoice.invoiceReference,
      amount: payload.amount,
      paymentDate: today,
      paymentMode: payload.paymentMethod,
      transactionRef: txnRef,
      status: 'SUCCESS',
      notes: payload.notes || 'Demo payment via Student Portal',
    };

    const updatedInvoice: StudentFeeInvoice = {
      ...targetInvoice,
      paidAmount: newPaidAmount,
      remainingBalance: newRemaining,
      status: newStatus,
      allowPayment: newRemaining > 0,
      paymentHistory: [newReceipt, ...(targetInvoice.paymentHistory || [])],
    };

    invoices[invoiceIndex] = updatedInvoice;
    payments.unshift(newReceipt);

    saveMock(STORAGE_KEYS.INVOICES, invoices);
    saveMock(STORAGE_KEYS.PAYMENTS, payments);

    return {
      success: true,
      message: 'Demo payment processed successfully! Invoice balance updated.',
      paymentReference: paymentRef,
      transactionRef: txnRef,
      amount: payload.amount,
      paidDate: today,
      invoice: updatedInvoice,
      receipt: newReceipt,
    };
  },

  /**
   * Fetch leave applications
   */
  async getLeaves(): Promise<LeaveApplication[]> {
    try {
      const live = await apiClient.get<LeaveApplication[]>('/student/leaves');
      if (Array.isArray(live)) return live;
    } catch {
      // Fallback
    }
    return loadMock<LeaveApplication[]>(STORAGE_KEYS.LEAVES, DEFAULT_LEAVES);
  },

  /**
   * Submit new leave application
   */
  async applyLeave(dto: ApplyLeaveDto): Promise<LeaveApplication> {
    try {
      const live = await apiClient.post<LeaveApplication>('/student/leaves', dto);
      if (live && live.id) return live;
    } catch {
      // Fallback
    }

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const leaves = loadMock<LeaveApplication[]>(STORAGE_KEYS.LEAVES, DEFAULT_LEAVES);
    const newLeave: LeaveApplication = {
      id: `LEV-${Date.now().toString().slice(-4)}`,
      leaveReference: `LEV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      startDate: dto.startDate,
      endDate: dto.endDate,
      numberOfDays: numberOfDays > 0 ? numberOfDays : 1,
      reason: dto.reason,
      destination: dto.destination || 'Not specified',
      contactDetails: dto.contactDetails || '',
      emergencyContact: dto.emergencyContact || '',
      status: 'PENDING',
      appliedDate: new Date().toISOString().split('T')[0],
      canCancel: true,
    };

    leaves.unshift(newLeave);
    saveMock(STORAGE_KEYS.LEAVES, leaves);
    return newLeave;
  },

  /**
   * Cancel a pending leave application
   */
  async cancelLeave(id: string): Promise<LeaveApplication> {
    try {
      const live = await apiClient.patch<LeaveApplication>(`/student/leaves/${id}/cancel`);
      if (live && live.id) return live;
    } catch {
      // Fallback
    }

    const leaves = loadMock<LeaveApplication[]>(STORAGE_KEYS.LEAVES, DEFAULT_LEAVES);
    const index = leaves.findIndex((l) => l.id === id);
    if (index === -1) throw new Error('Leave application not found');

    if (leaves[index].status !== 'PENDING') {
      throw new Error('Only pending leave applications can be cancelled');
    }

    leaves[index].status = 'CANCELLED';
    leaves[index].canCancel = false;
    saveMock(STORAGE_KEYS.LEAVES, leaves);
    return leaves[index];
  },

  /**
   * Fetch complaints
   */
  async getComplaints(): Promise<Complaint[]> {
    try {
      const live = await apiClient.get<Complaint[]>('/student/complaints');
      if (Array.isArray(live)) return live;
    } catch {
      // Fallback
    }
    return loadMock<Complaint[]>(STORAGE_KEYS.COMPLAINTS, DEFAULT_COMPLAINTS);
  },

  /**
   * Lodge new complaint
   */
  async createComplaint(dto: CreateComplaintDto): Promise<Complaint> {
    try {
      const live = await apiClient.post<Complaint>('/student/complaints', dto);
      if (live && live.id) return live;
    } catch {
      // Fallback
    }

    const complaints = loadMock<Complaint[]>(STORAGE_KEYS.COMPLAINTS, DEFAULT_COMPLAINTS);
    const newComplaint: Complaint = {
      id: `CMP-${Date.now().toString().slice(-4)}`,
      complaintReference: `CMP-${dto.category.toUpperCase().slice(0, 4)}-${Math.floor(100 + Math.random() * 900)}`,
      category: dto.category,
      title: dto.title,
      description: dto.description,
      priority: dto.priority || 'MEDIUM',
      status: 'OPEN',
      submissionDate: new Date().toISOString().split('T')[0],
      attachmentUrl: dto.attachmentUrl,
    };

    complaints.unshift(newComplaint);
    saveMock(STORAGE_KEYS.COMPLAINTS, complaints);
    return newComplaint;
  },

  /**
   * Fetch configured hostel contact details
   */
  async getHostelContact(): Promise<StudentHostelInfo> {
    try {
      const live = await apiClient.get<StudentHostelInfo>('/student/contact');
      if (live && live.name) return live;
    } catch {
      // Fallback
    }
    const profile = await this.getProfile();
    return profile.hostelInfo || DEFAULT_HOSTEL_INFO;
  },
};

