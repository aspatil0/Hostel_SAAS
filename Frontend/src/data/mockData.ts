import type { Property, PropertyAdmin, MarketingPost, Student, RentRecord } from '@/types/property';

export const initialProperties: Property[] = [
  {
    id: 'PROP-01',
    name: 'Grand Skyline Premier Hostel',
    address: 'Opp. University North Gate, Powai',
    city: 'Mumbai',
    image:
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    ownerName: 'Rahul Sharma',
    ownerPhone: '+91 98201 12345',
    ownerEmail: 'rahul.sharma@skylinehostels.com',
    totalRooms: 45,
    totalBeds: 120,
    occupiedBeds: 108,
    status: 'active',
    createdAt: '2026-08-15',
  },
];

export const initialPropertyAdmins: PropertyAdmin[] = [
  {
    id: 'ADM-01',
    ownerName: 'Rahul Sharma',
    phone: '+91 98201 12345',
    email: 'rahul.sharma@skylinehostels.com',
    propertyName: 'Grand Skyline Premier Hostel',
    address: 'Opp. University North Gate, Powai Road',
    city: 'Mumbai',
    image:
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    totalRooms: 45,
    totalBeds: 120,
    occupiedBeds: 108,
    portalPassword: 'Skyline@2026',
    status: 'active',
    joinedDate: '2026-08-15',
  },
];

export const initialMarketingPosts: MarketingPost[] = [
  {
    id: 'MKT-01',
    propertyId: 'PROP-01',
    propertyName: 'Grand Skyline Premier Hostel',
    city: 'Mumbai',
    address: 'Opp. University North Gate, Powai Road',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    headline: '✨ Premium Campus Living — Now Open for Admissions!',
    description: 'Fully furnished AC rooms with dedicated study desks, 24/7 biometric security, fiber-optic WiFi, and 4 hygienic meals daily. Just 2 mins from university gates.',
    startingPrice: 12500,
    likes: 342,
    views: 2840,
    inquiries: 48,
    isLiveOnLandingPage: true,
    socialLinks: {
      whatsapp: 'https://wa.me/919820112345?text=Hi,%20I%20am%20interested%20in%20Grand%20Skyline%20Hostel',
      instagram: 'https://instagram.com',
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
    },
    createdAt: '2026-10-15',
  },
];

export const initialStudents: Student[] = [
  {
    id: 'STU-101',
    name: 'Aarav Mehta',
    phone: '+91 98111 22334',
    email: 'aarav.mehta@iitb.ac.in',
    guardianName: 'Rajesh Mehta',
    guardianPhone: '+91 98111 00112',
    collegeOrCompany: 'IIT Bombay (CSE)',
    roomNumber: '101',
    bedNumber: 'Bed A',
    monthlyRent: 12500,
    depositAmount: 25000,
    checkInDate: '2026-07-15',
    status: 'active',
    idProofNumber: 'Aadhar **** 4892',
  },
  {
    id: 'STU-102',
    name: 'Rohan Deshmukh',
    phone: '+91 98222 33445',
    email: 'rohan.d@spit.ac.in',
    guardianName: 'Sanjay Deshmukh',
    guardianPhone: '+91 98222 00223',
    collegeOrCompany: 'SPIT Andheri (IT)',
    roomNumber: '101',
    bedNumber: 'Bed B',
    monthlyRent: 12500,
    depositAmount: 25000,
    checkInDate: '2026-08-01',
    status: 'active',
    idProofNumber: 'Aadhar **** 7120',
  },
];

export const initialRentRecords: RentRecord[] = [
  {
    id: 'RNT-2026-10-01',
    studentId: 'STU-101',
    studentName: 'Aarav Mehta',
    roomNumber: '101',
    month: 'October 2026',
    amount: 12500,
    paidAmount: 12500,
    dueDate: '2026-10-05',
    paidDate: '2026-10-03',
    status: 'paid',
    paymentMode: 'UPI',
  },
  {
    id: 'RNT-2026-10-02',
    studentId: 'STU-102',
    studentName: 'Rohan Deshmukh',
    roomNumber: '101',
    month: 'October 2026',
    amount: 12500,
    paidAmount: 12500,
    dueDate: '2026-10-05',
    paidDate: '2026-10-04',
    status: 'paid',
    paymentMode: 'UPI',
  },
];
