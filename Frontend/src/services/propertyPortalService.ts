import { apiClient } from './apiClient';
import { initialStudents, initialRentRecords } from '../data/mockData';
import type { Student, RentRecord } from '../types/property';

export interface DashboardData {
  propertyId: number;
  propertyName: string;
  occupancy: {
    totalBeds: number;
    occupiedBeds: number;
    vacantBeds: number;
    occupancyPercentage: number;
  };
  financials: {
    totalMonthlyBilled: number;
    collectedRent: number;
    pendingRent: number;
  };
  recentStudents: Student[];
  recentRentRecords: RentRecord[];
}

export interface BedSlot {
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
}

export interface RoomNode {
  roomNumber: string;
  floor: number;
  wing: 'East' | 'West';
  type: string;
  price: number;
  beds: BedSlot[];
}

export interface PropertyProfileData {
  hostelData: {
    name: string;
    tagline: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    contactPhone: string;
    contactEmail: string;
    totalRooms: number;
    totalBeds: number;
    curfewTime: string;
    messBreakfast: string;
    messDinner: string;
  };
  managerData: {
    name: string;
    role: string;
    phone: string;
    email: string;
    emergencyPhone: string;
  };
  amenities: Record<string, boolean>;
}

export const propertyPortalService = {
  async getDashboard(): Promise<DashboardData> {
    try {
      const data = await apiClient.get<DashboardData>('/property-portal/dashboard');
      if (data && data.occupancy) {
        return data;
      }
    } catch (e) {
      console.warn('Property portal dashboard API offline, using local fallback:', e);
    }

    const totalBeds = 120;
    const occupiedBeds = initialStudents.length;
    const vacantBeds = totalBeds - occupiedBeds;
    const occupancyPercentage = Math.round((occupiedBeds / totalBeds) * 100);

    const totalMonthlyBilled = initialRentRecords.reduce((sum, r) => sum + r.amount, 0);
    const collectedRent = initialRentRecords
      .filter((r) => r.status === 'paid')
      .reduce((sum, r) => sum + r.paidAmount, 0);
    const pendingRent = totalMonthlyBilled - collectedRent;

    return {
      propertyId: 1,
      propertyName: 'Grand Skyline Premier Hostel',
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
      recentStudents: initialStudents,
      recentRentRecords: initialRentRecords,
    };
  },

  async getStudents(search?: string, status?: string): Promise<Student[]> {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status && status !== 'all') params.append('status', status);
      const query = params.toString();
      const data = await apiClient.get<Student[]>(
        `/property-portal/students${query ? `?${query}` : ''}`
      );
      if (Array.isArray(data)) {
        return data;
      }
    } catch (e) {
      console.warn('Property portal students API offline, using fallback:', e);
    }
    return initialStudents;
  },

  async createStudent(studentData: Partial<Student>): Promise<Student> {
    try {
      const created = await apiClient.post<Student>('/property-portal/students', studentData);
      if (created && created.id) {
        return created;
      }
    } catch (e) {
      console.warn('Property portal create student API failed, falling back to local:', e);
    }

    return {
      id: `STU-${Date.now().toString().slice(-4)}`,
      name: studentData.name || 'New Resident',
      phone: studentData.phone || '+91 98000 00000',
      email: studentData.email || '',
      guardianName: studentData.guardianName || '',
      guardianPhone: studentData.guardianPhone || '',
      collegeOrCompany: studentData.collegeOrCompany || '',
      roomNumber: studentData.roomNumber || '101',
      bedNumber: studentData.bedNumber || 'Bed A',
      monthlyRent: Number(studentData.monthlyRent) || 12500,
      depositAmount: Number(studentData.depositAmount) || 25000,
      checkInDate: studentData.checkInDate || new Date().toISOString().split('T')[0],
      status: 'active',
      idProofNumber: studentData.idProofNumber || 'Aadhar Verified',
    };
  },

  async checkoutStudent(id: string): Promise<void> {
    try {
      await apiClient.patch(`/property-portal/students/${id}/checkout`);
    } catch (e) {
      console.warn('Checkout API offline:', e);
    }
  },

  async getRentRecords(search?: string, status?: string, month?: string): Promise<RentRecord[]> {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status && status !== 'all') params.append('status', status);
      if (month && month !== 'all') params.append('month', month);
      const query = params.toString();
      const data = await apiClient.get<RentRecord[]>(
        `/property-portal/rent${query ? `?${query}` : ''}`
      );
      if (Array.isArray(data)) {
        return data;
      }
    } catch (e) {
      console.warn('Property portal rent API offline, using fallback:', e);
    }
    return initialRentRecords;
  },

  async recordPayment(paymentData: {
    studentId: string;
    amount: number;
    paymentMode: string;
    transactionRef?: string;
    paymentDate?: string;
    month?: string;
  }): Promise<RentRecord> {
    try {
      const record = await apiClient.post<RentRecord>('/property-portal/rent/record', paymentData);
      if (record && record.id) {
        return record;
      }
    } catch (e) {
      console.warn('Record payment API failed, local fallback:', e);
    }

    return {
      id: `RENT-${Date.now().toString().slice(-4)}`,
      studentId: paymentData.studentId,
      studentName: 'Resident',
      roomNumber: '101',
      month: paymentData.month || 'October 2026',
      amount: paymentData.amount,
      paidAmount: paymentData.amount,
      dueDate: new Date().toISOString().split('T')[0],
      paidDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
      status: 'paid',
      paymentMode: paymentData.paymentMode as any,
      transactionRef: paymentData.transactionRef,
    };
  },

  async getRooms(): Promise<RoomNode[]> {
    try {
      const rooms = await apiClient.get<RoomNode[]>('/property-portal/rooms');
      if (Array.isArray(rooms) && rooms.length > 0) {
        return rooms;
      }
    } catch (e) {
      console.warn('Rooms API offline:', e);
    }
    return [
      {
        roomNumber: '101',
        floor: 1,
        wing: 'East',
        type: 'Double Sharing AC',
        price: 12500,
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
  },

  async allocateRoom(data: {
    roomNumber: string;
    bedId: string;
    status: 'occupied' | 'vacant' | 'maintenance';
    student?: any;
  }): Promise<any> {
    try {
      return await apiClient.post('/property-portal/rooms/allocate', data);
    } catch (e) {
      console.warn('Allocate room API failed:', e);
      return data;
    }
  },

  async getProfile(): Promise<PropertyProfileData> {
    try {
      const data = await apiClient.get<PropertyProfileData>('/property-portal/profile');
      if (data && data.hostelData) {
        return data;
      }
    } catch (e) {
      console.warn('Get profile API offline:', e);
    }
    return {
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
  },

  async updateProfile(profileData: Partial<PropertyProfileData>): Promise<any> {
    try {
      return await apiClient.patch('/property-portal/profile', profileData);
    } catch (e) {
      console.warn('Update profile API failed:', e);
      return { success: true, profile: profileData };
    }
  },
};
