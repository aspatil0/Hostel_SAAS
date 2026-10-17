import { apiClient } from './apiClient';
import { initialProperties } from '../data/mockData';
import type { Property } from '../types/property';

export const propertyService = {
  async getProperties(search?: string, status?: string): Promise<Property[]> {
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (status && status !== 'all') {
        queryParams.append('status', status.toUpperCase());
      }

      const queryString = queryParams.toString();
      const endpoint = `/properties${queryString ? `?${queryString}` : ''}`;
      const response = await apiClient.get<Property[]>(endpoint);

      if (Array.isArray(response) && response.length > 0) {
        return response;
      }
      return initialProperties;
    } catch (error) {
      console.warn('Backend /properties offline or unreachable, using local store:', error);
      return initialProperties;
    }
  },

  async getProperty(id: string | number): Promise<Property | null> {
    const rawId = typeof id === 'string' && id.startsWith('PROP-') ? parseInt(id.replace('PROP-', ''), 10) : id;

    try {
      return await apiClient.get<Property>(`/properties/${rawId}`);
    } catch {
      return initialProperties.find((p) => p.id === String(id) || p.id === `PROP-${id}`) || null;
    }
  },

  async createProperty(data: {
    name: string;
    address: string;
    city?: string;
    image?: string;
    ownerName?: string;
    ownerPhone?: string;
    ownerEmail?: string;
    totalRooms?: number;
    totalBeds?: number;
    status?: 'active' | 'inactive';
  }): Promise<Property> {
    try {
      const response = await apiClient.post<Property>('/properties', {
        name: data.name,
        propertyType: 'HOSTEL',
        address: data.address,
      });

      return {
        ...response,
        image: data.image || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
        city: data.city || 'Mumbai',
        ownerName: data.ownerName || 'Unassigned',
        ownerPhone: data.ownerPhone || '',
        ownerEmail: data.ownerEmail || '',
        totalRooms: data.totalRooms || 30,
        totalBeds: data.totalBeds || 80,
        occupiedBeds: 0,
        status: data.status || 'active',
      };
    } catch {
      // Offline fallback: generate mock property
      return {
        id: `PROP-${Date.now().toString().slice(-2)}`,
        name: data.name,
        address: data.address,
        city: data.city || 'Mumbai',
        image: data.image || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
        ownerName: data.ownerName || 'Unassigned',
        ownerPhone: data.ownerPhone || '',
        ownerEmail: data.ownerEmail || '',
        totalRooms: data.totalRooms || 30,
        totalBeds: data.totalBeds || 80,
        occupiedBeds: 0,
        status: data.status || 'active',
        createdAt: new Date().toISOString().split('T')[0],
      };
    }
  },

  async updateProperty(
    id: string | number,
    data: Partial<Property>
  ): Promise<any> {
    const rawId = typeof id === 'string' && id.startsWith('PROP-') ? parseInt(id.replace('PROP-', ''), 10) : id;

    try {
      return await apiClient.patch(`/properties/${rawId}`, {
        name: data.name,
        address: data.address,
      });
    } catch {
      return { id, ...data };
    }
  },

  async updatePropertyStatus(
    id: string | number,
    status: 'active' | 'inactive'
  ): Promise<any> {
    const rawId = typeof id === 'string' && id.startsWith('PROP-') ? parseInt(id.replace('PROP-', ''), 10) : id;

    try {
      return await apiClient.patch(`/properties/${rawId}/status`, {
        status: status.toUpperCase(),
      });
    } catch {
      return { id, status };
    }
  },
};
