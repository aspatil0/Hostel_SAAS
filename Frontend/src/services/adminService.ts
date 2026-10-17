import { apiClient } from './apiClient';
import { initialPropertyAdmins } from '../data/mockData';
import type { PropertyAdmin } from '../types/property';

export const adminService = {
  async getAdmins(search?: string, status?: string): Promise<PropertyAdmin[]> {
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (status && status !== 'all') {
        queryParams.append('status', status.toUpperCase());
      }

      const queryString = queryParams.toString();
      const endpoint = `/admins${queryString ? `?${queryString}` : ''}`;
      const response = await apiClient.get<PropertyAdmin[]>(endpoint);

      if (Array.isArray(response) && response.length > 0) {
        return response.map((a: any) => ({
          ...a,
          id: a.id ? (typeof a.id === 'number' ? `ADM-${String(a.id).padStart(2, '0')}` : a.id) : `ADM-01`,
          ownerName: a.ownerName || a.name || 'Admin',
          phone: a.phone || '+91 98201 12345',
          email: a.email || '',
          propertyName: a.propertyName || 'Assigned Hostel',
          address: a.address || 'Campus Location',
          city: a.city || 'Mumbai',
          image:
            a.image ||
            'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
          totalRooms: a.totalRooms || 35,
          totalBeds: a.totalBeds || 90,
          status: a.status === 'ACTIVE' || a.status === 'active' ? 'active' : 'inactive',
          joinedDate: a.joinedDate || new Date().toISOString().split('T')[0],
        }));
      }
      return initialPropertyAdmins;
    } catch (error) {
      console.warn('Backend /admins offline or unreachable, using local store:', error);
      return initialPropertyAdmins;
    }
  },

  async createAdmin(data: {
    ownerName: string;
    email: string;
    phone: string;
    propertyName: string;
    address: string;
    city?: string;
    image?: string;
    totalRooms?: number;
    totalBeds?: number;
    propertyId?: number;
    password?: string;
    status?: 'active' | 'inactive';
  }): Promise<PropertyAdmin> {
    try {
      const response = await apiClient.post<any>('/admins', {
        name: data.ownerName,
        email: data.email,
        password: data.password || 'HostelAdmin@123',
        propertyId: data.propertyId || 1,
        phone: data.phone,
      });

      return {
        id: `ADM-${response.id || Date.now().toString().slice(-2)}`,
        ownerName: response.name || data.ownerName,
        email: response.email || data.email,
        phone: data.phone,
        propertyName: response.propertyName || data.propertyName,
        address: data.address,
        city: data.city || 'Mumbai',
        image:
          data.image ||
          'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
        totalRooms: data.totalRooms || 30,
        totalBeds: data.totalBeds || 80,
        status: data.status || 'active',
        joinedDate: new Date().toISOString().split('T')[0],
      };
    } catch {
      // Offline fallback: generate local admin
      return {
        id: `ADM-${Date.now().toString().slice(-2)}`,
        ownerName: data.ownerName,
        email: data.email,
        phone: data.phone,
        propertyName: data.propertyName,
        address: data.address,
        city: data.city || 'Mumbai',
        image:
          data.image ||
          'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
        totalRooms: data.totalRooms || 30,
        totalBeds: data.totalBeds || 80,
        status: data.status || 'active',
        joinedDate: new Date().toISOString().split('T')[0],
      };
    }
  },

  async updateAdmin(
    id: string | number,
    data: Partial<PropertyAdmin>
  ): Promise<any> {
    const rawId = typeof id === 'string' && id.startsWith('ADM-') ? parseInt(id.replace('ADM-', ''), 10) : id;

    try {
      return await apiClient.patch(`/admins/${rawId}`, {
        name: data.ownerName,
        email: data.email,
        phone: data.phone,
      });
    } catch {
      return { id, ...data };
    }
  },

  async updateAdminStatus(
    id: string | number,
    status: 'active' | 'inactive'
  ): Promise<any> {
    const rawId = typeof id === 'string' && id.startsWith('ADM-') ? parseInt(id.replace('ADM-', ''), 10) : id;

    try {
      return await apiClient.patch(`/admins/${rawId}/status`, {
        status: status.toUpperCase(),
      });
    } catch {
      return { id, status };
    }
  },
};
