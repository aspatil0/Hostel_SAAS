export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  image: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface PropertyAdminFormData {
  propertyName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  image: string;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds?: number;
  portalPassword?: string;
  status: 'active' | 'inactive';
}

export interface PropertyAdmin {
  id: string;
  ownerName: string;
  phone: string;
  email: string;
  propertyName: string;
  address: string;
  city: string;
  image: string;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds?: number;
  portalPassword?: string;
  status: 'active' | 'inactive';
  joinedDate: string;
}

export interface MarketingPost {
  id: string;
  propertyId: string;
  propertyName: string;
  city: string;
  address: string;
  image: string;
  headline: string;
  description: string;
  startingPrice: number;
  likes: number;
  views: number;
  inquiries: number;
  isLiveOnLandingPage: boolean;
  socialLinks: {
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  createdAt: string;
}

export interface Student {
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
  status: 'active' | 'checked_out' | 'pending';
  idProofNumber?: string;
}

export interface RentRecord {
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
}