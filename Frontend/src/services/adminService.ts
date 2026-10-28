import { apiClient } from './apiClient';
import { initialPropertyAdmins } from '../data/mockData';
import type { PropertyAdmin } from '../types/property';
import { CUSTOM_ADMINS_KEY, getStoredCustomProperties, saveStoredCustomProperty } from './propertyService';

export function getStoredCustomAdmins(): PropertyAdmin[] {
  try {
    const raw = localStorage.getItem(CUSTOM_ADMINS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Could not read custom admins from storage:', e);
  }
  return [];
}

export function saveStoredCustomAdmin(admin: PropertyAdmin) {
  try {
    const current = getStoredCustomAdmins();
    const filtered = current.filter(
      (a) => a.id !== admin.id && a.email.toLowerCase() !== admin.email.toLowerCase()
    );
    localStorage.setItem(CUSTOM_ADMINS_KEY, JSON.stringify([admin, ...filtered]));
  } catch (e) {
    console.warn('Could not save custom admin to storage:', e);
  }
}

export const adminService = {
  async getAdmins(search?: string, status?: string): Promise<PropertyAdmin[]> {
    let baseAdmins: PropertyAdmin[] = [];

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
        baseAdmins = response.map((a: any) => ({
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
      } else {
        baseAdmins = initialPropertyAdmins;
      }
    } catch (error) {
      console.warn('Backend /admins offline or unreachable, using local store:', error);
      baseAdmins = initialPropertyAdmins;
    }

    const customAdmins = getStoredCustomAdmins();
    const customProps = getStoredCustomProperties();

    // Map by property name and email
    const adminMap = new Map<string, PropertyAdmin>();

    // 1. Add explicitly saved custom admins
    for (const a of customAdmins) {
      adminMap.set(a.propertyName.toLowerCase().trim(), a);
    }

    // 2. Synthesize admins from custom properties if ownerName was given and not yet in adminMap
    for (const p of customProps) {
      const key = p.name.toLowerCase().trim();
      if (!adminMap.has(key) && p.ownerName && p.ownerName !== 'Unassigned') {
        const syntheticAdmin: PropertyAdmin = {
          id: `ADM-${p.id.replace('PROP-', '')}`,
          ownerName: p.ownerName,
          phone: p.ownerPhone || '+91 98201 12345',
          email:
            p.ownerEmail ||
            `${p.ownerName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@hostelos.com`,
          propertyName: p.name,
          address: p.address,
          city: p.city,
          image: p.image,
          totalRooms: p.totalRooms,
          totalBeds: p.totalBeds,
          occupiedBeds: p.occupiedBeds,
          portalPassword: 'Hostel@2026',
          status: p.status,
          joinedDate: p.createdAt || new Date().toISOString().split('T')[0],
        };
        adminMap.set(key, syntheticAdmin);
      }
    }

    // 3. Add base admins from API / initial mock
    for (const a of baseAdmins) {
      const key = a.propertyName.toLowerCase().trim();
      if (!adminMap.has(key)) {
        adminMap.set(key, a);
      }
    }

    let combined = Array.from(adminMap.values());

    if (status && status !== 'all') {
      combined = combined.filter((a) => a.status === status);
    }

    if (search) {
      const query = search.toLowerCase();
      combined = combined.filter(
        (admin) =>
          admin.ownerName.toLowerCase().includes(query) ||
          admin.propertyName.toLowerCase().includes(query) ||
          admin.email.toLowerCase().includes(query) ||
          admin.phone.toLowerCase().includes(query) ||
          admin.address.toLowerCase().includes(query)
      );
    }

    return combined;
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
    occupiedBeds?: number;
    propertyId?: number;
    password?: string;
    portalPassword?: string;
    status?: 'active' | 'inactive';
  }): Promise<PropertyAdmin> {
    let createdAdmin: PropertyAdmin;

    try {
      const payload = {
        name: data.ownerName,
        email: data.email,
        password: data.portalPassword || data.password || 'HostelAdmin@123',
        portalPassword: data.portalPassword || data.password || 'HostelAdmin@123',
        propertyName: data.propertyName,
        address: data.address,
        city: data.city || 'Mumbai',
        image: data.image,
        totalRooms: data.totalRooms || 30,
        totalBeds: data.totalBeds || 80,
        occupiedBeds: data.occupiedBeds || 68,
        propertyId: data.propertyId,
        phone: data.phone,
        status: data.status || 'active',
      };

      const response = await apiClient.post<any>('/admins', payload);

      createdAdmin = {
        id: `ADM-${response.id || Date.now().toString().slice(-4)}`,
        ownerName: response.ownerName || response.name || data.ownerName,
        email: response.email || data.email,
        phone: response.phone || data.phone,
        propertyName: response.propertyName || data.propertyName,
        address: response.address || data.address,
        city: response.city || data.city || 'Mumbai',
        image:
          data.image ||
          'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
        totalRooms: Number(data.totalRooms || 30),
        totalBeds: Number(data.totalBeds || 80),
        occupiedBeds: Number(data.occupiedBeds || 68),
        portalPassword: response.portalPassword || data.portalPassword || 'HostelAdmin@123',
        status: data.status || 'active',
        joinedDate: response.joinedDate || new Date().toISOString().split('T')[0],
      };
    } catch (err) {
      console.warn('Failed to create admin via API, fallback to local store:', err);
      createdAdmin = {
        id: `ADM-${Date.now().toString().slice(-4)}`,
        ownerName: data.ownerName,
        email: data.email,
        phone: data.phone,
        propertyName: data.propertyName,
        address: data.address,
        city: data.city || 'Mumbai',
        image:
          data.image ||
          'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
        totalRooms: Number(data.totalRooms || 30),
        totalBeds: Number(data.totalBeds || 80),
        occupiedBeds: Number(data.occupiedBeds || 68),
        portalPassword: data.portalPassword || 'Hostel@2026',
        status: data.status || 'active',
        joinedDate: new Date().toISOString().split('T')[0],
      };
    }

    // Persist custom admin to localStorage
    saveStoredCustomAdmin(createdAdmin);

    // Also ensure this property exists in custom properties storage
    saveStoredCustomProperty({
      id: `PROP-${createdAdmin.id.replace('ADM-', '')}`,
      name: createdAdmin.propertyName,
      address: createdAdmin.address,
      city: createdAdmin.city,
      image: createdAdmin.image,
      ownerName: createdAdmin.ownerName,
      ownerPhone: createdAdmin.phone,
      ownerEmail: createdAdmin.email,
      totalRooms: createdAdmin.totalRooms,
      totalBeds: createdAdmin.totalBeds,
      occupiedBeds: createdAdmin.occupiedBeds ?? 0,
      status: createdAdmin.status,
      createdAt: createdAdmin.joinedDate,
    });

    return createdAdmin;
  },

  async updateAdmin(
    id: string | number,
    data: Partial<PropertyAdmin>
  ): Promise<any> {
    const rawId = typeof id === 'string' && id.startsWith('ADM-') ? parseInt(id.replace('ADM-', ''), 10) : id;

    try {
      await apiClient.patch(`/admins/${rawId}`, {
        name: data.ownerName,
        email: data.email,
        phone: data.phone,
      });
    } catch {
      // offline fallback
    }

    const customAdmins = getStoredCustomAdmins();
    const updated = customAdmins.map((a) =>
      a.id === id || a.id === `ADM-${id}` ? { ...a, ...data } : a
    );
    localStorage.setItem(CUSTOM_ADMINS_KEY, JSON.stringify(updated));

    return { id, ...data };
  },

  async updateAdminStatus(
    id: string | number,
    status: 'active' | 'inactive'
  ): Promise<any> {
    const rawId = typeof id === 'string' && id.startsWith('ADM-') ? parseInt(id.replace('ADM-', ''), 10) : id;

    try {
      await apiClient.patch(`/admins/${rawId}/status`, {
        status: status.toUpperCase(),
      });
    } catch {
      // offline fallback
    }

    const customAdmins = getStoredCustomAdmins();
    const updated = customAdmins.map((a) =>
      a.id === id || a.id === `ADM-${id}` ? { ...a, status } : a
    );
    localStorage.setItem(CUSTOM_ADMINS_KEY, JSON.stringify(updated));

    return { id, status };
  },
};
