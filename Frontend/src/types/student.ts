export type FeeCategory =
  | 'RENT'
  | 'MESS'
  | 'ELECTRICITY'
  | 'MAINTENANCE'
  | 'LAUNDRY'
  | 'DEPOSIT'
  | 'OTHER';

export type InvoiceStatus =
  | 'UNPAID'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED';

export type LeaveStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export type ComplaintCategory =
  | 'Room'
  | 'Plumbing'
  | 'Electricity'
  | 'Cleaning'
  | 'Mess'
  | 'Wi-Fi'
  | 'Maintenance'
  | 'Other';

export type ComplaintStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED';

export type ComplaintPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'URGENT';

export interface RoomDetails {
  roomNumber: string;
  floor: number;
  wing?: string;
  building?: string;
  bedNumber: string;
  roomType: string;
  monthlyRent: number;
  depositAmount: number;
}

export interface StudentHostelInfo {
  id: number | string;
  name: string;
  tagline?: string;
  address: string;
  city: string;
  state?: string;
  pincode?: string;
  contactPhone: string;
  contactEmail: string;
  emergencyPhone?: string;
  curfewTime?: string;
  messTimings?: {
    breakfast: string;
    lunch?: string;
    dinner: string;
  };
  wardenName?: string;
  wardenPhone?: string;
  managerEmail?: string;
  officeHours?: string;
}

export interface StudentProfile {
  id: string;
  studentCode: string;
  name: string;
  email: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  guardianRelation?: string;
  emergencyContact: string;
  collegeOrCompany: string;
  idProofNumber?: string;
  checkInDate: string;
  status: 'active' | 'inactive' | 'checked_out';
  roomDetails: RoomDetails;
  hostelInfo: StudentHostelInfo;
}

export interface PaymentReceipt {
  id: string;
  paymentReference: string;
  invoiceId: string;
  invoiceReference: string;
  amount: number;
  paymentDate: string;
  paymentMode: 'UPI' | 'Card' | 'NetBanking' | 'Cash';
  transactionRef: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  receiptUrl?: string;
  notes?: string;
}

export interface StudentFeeInvoice {
  id: string;
  invoiceReference: string;
  feeCategory: FeeCategory;
  billingPeriod: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  remainingBalance: number;
  status: InvoiceStatus;
  allowPayment: boolean;
  paymentHistory?: PaymentReceipt[];
}

export interface DemoPaymentRequest {
  invoiceId: string;
  invoiceReference: string;
  amount: number;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking';
  upiId?: string;
  notes?: string;
}

export interface DemoPaymentResponse {
  success: boolean;
  message: string;
  paymentReference: string;
  transactionRef: string;
  amount: number;
  paidDate: string;
  invoice: StudentFeeInvoice;
  receipt: PaymentReceipt;
}

export interface LeaveApplication {
  id: string;
  leaveReference: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  destination?: string;
  contactDetails?: string;
  emergencyContact?: string;
  status: LeaveStatus;
  appliedDate: string;
  rejectionReason?: string;
  approvedBy?: string;
  decisionDate?: string;
  canCancel: boolean;
}

export interface ApplyLeaveDto {
  startDate: string;
  endDate: string;
  reason: string;
  destination?: string;
  contactDetails?: string;
  emergencyContact?: string;
}

export interface Complaint {
  id: string;
  complaintReference: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  submissionDate: string;
  attachmentUrl?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  assignedStaff?: string;
}

export interface CreateComplaintDto {
  category: ComplaintCategory;
  title: string;
  description: string;
  priority?: ComplaintPriority;
  attachmentUrl?: string;
}

export interface StudentDashboardSummary {
  student: {
    id: string;
    studentCode: string;
    name: string;
    email: string;
    phone: string;
    checkInDate: string;
    status: string;
  };
  accommodation: {
    hostelName: string;
    building: string;
    floor: number;
    roomNumber: string;
    bedNumber: string;
    roomType: string;
    address: string;
    curfewTime: string;
  };
  financialOverview: {
    outstandingBalance: number;
    nextDueAmount: number;
    nextDueDate: string;
    totalPaidThisSemester: number;
  };
  recentInvoices: StudentFeeInvoice[];
  recentPayments: PaymentReceipt[];
  activeLeaves: LeaveApplication[];
  recentComplaints: Complaint[];
  hostelContact: StudentHostelInfo;
}

