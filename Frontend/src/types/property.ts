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
  status: 'active' | 'inactive';
  joinedDate: string;
}
