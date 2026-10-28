import { apiClient } from './apiClient';
import { initialProperties } from '../data/mockData';
import type { Property } from '../types/property';

export const CUSTOM_PROPERTIES_KEY = 'hostelos_custom_properties';
export const CUSTOM_ADMINS_KEY = 'hostelos_custom_admins';

export function getStoredCustomProperties(): Property[] {
  try {
    const raw = localStorage.getItem(CUSTOM_PROPERTIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Could not read custom properties from storage:', e);
  }
  return [];
}

export function saveStoredCustomProperty(property: Property) {
  try {
    const current = getStoredCustomProperties();
    const filtered = current.filter(
      (p) => p.id !== property.id && p.name.toLowerCase() !== property.name.toLowerCase()
    );
    localStorage.setItem(CUSTOM_PROPERTIES_KEY, JSON.stringify([property, ...filtered]));
  } catch (e) {
    console.warn('Could not save custom property to storage:', e);
  }
}

export const propertyService = {
  async getProperties(search?: string, status?: string): Promise<Property[]> {
    const customProps = getStoredCustomProperties();
    let baseProperties: Property[] = [];

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
        baseProperties = response;
      } else {
        baseProperties = initialProperties;
      }
    } catch (error) {
      console.warn('Backend /properties offline or unreachable, using local store:', error);
      baseProperties = initialProperties;
    }

    // Merge custom stored properties with base properties without duplicates
    const propMap = new Map<string, Property>();
    for (const p of customProps) {
      propMap.set(p.name.toLowerCase().trim(), p);
    }
    for (const p of baseProperties) {
      const key = p.name.toLowerCase().trim();
      if (!propMap.has(key)) {
        propMap.set(key, p);
      }
    }

    let combined = Array.from(propMap.values());

    if (status && status !== 'all') {
      combined = combined.filter((p) => p.status === status);
    }

    if (search) {
      const query = search.toLowerCase();
      combined = combined.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.city.toLowerCase().includes(query) ||
          p.ownerName.toLowerCase().includes(query) ||
          p.address.toLowerCase().includes(query)
      );
    }

    return combined;
  },

  async getProperty(id: string | number): Promise<Property | null> {
    const rawId = typeof id === 'string' && id.startsWith('PROP-') ? parseInt(id.replace('PROP-', ''), 10) : id;

    try {
      return await apiClient.get<Property>(`/properties/${rawId}`);
    } catch {
      const all = await this.getProperties();
      return all.find((p) => p.id === String(id) || p.id === `PROP-${id}`) || null;
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
    let createdProperty: Property;

    try {
      const response = await apiClient.post<Property>('/properties', {
        name: data.name,
        propertyType: 'HOSTEL',
        address: data.address,
        city: data.city || 'Mumbai',
        image: data.image,
        ownerName: data.ownerName,
        ownerPhone: data.ownerPhone,
        ownerEmail: data.ownerEmail,
        totalRooms: data.totalRooms || 30,
        totalBeds: data.totalBeds || 80,
        status: data.status || 'active',
      });

      createdProperty = {
        ...response,
        image: data.image || response.image || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
        city: data.city || response.city || 'Mumbai',
        ownerName: data.ownerName || response.ownerName || 'Unassigned',
        ownerPhone: data.ownerPhone || response.ownerPhone || '',
        ownerEmail: data.ownerEmail || response.ownerEmail || '',
        totalRooms: Number(data.totalRooms || response.totalRooms || 30),
        totalBeds: Number(data.totalBeds || response.totalBeds || 80),
        occupiedBeds: response.occupiedBeds ?? 0,
        status: data.status || response.status || 'active',
      };
    } catch (err) {
      console.warn('Failed to create property via API, using local storage fallback:', err);
      createdProperty = {
        id: `PROP-${Date.now().toString().slice(-4)}`,
        name: data.name,
        address: data.address,
        city: data.city || 'Mumbai',
        image: data.image || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
        ownerName: data.ownerName || 'Unassigned',
        ownerPhone: data.ownerPhone || '',
        ownerEmail: data.ownerEmail || '',
        totalRooms: Number(data.totalRooms || 30),
        totalBeds: Number(data.totalBeds || 80),
        occupiedBeds: 0,
        status: data.status || 'active',
        createdAt: new Date().toISOString().split('T')[0],
      };
    }

    // Persist to local storage
    saveStoredCustomProperty(createdProperty);

    // If owner/admin details provided, also persist custom admin so Property Admins page sees it immediately
    if (data.ownerName && data.ownerName.trim()) {
      try {
        const rawCustomAdmins = localStorage.getItem(CUSTOM_ADMINS_KEY);
        const customAdmins = rawCustomAdmins ? JSON.parse(rawCustomAdmins) : [];
        const existingAdmin = customAdmins.find(
          (a: any) =>
            a.propertyName.toLowerCase() === data.name.toLowerCase().trim() ||
            (data.ownerEmail && a.email.toLowerCase() === data.ownerEmail.toLowerCase().trim())
        );

        if (!existingAdmin) {
          const newAdmin = {
            id: `ADM-${Date.now().toString().slice(-4)}`,
            ownerName: data.ownerName.trim(),
            phone: data.ownerPhone || '+91 98201 12345',
            email:
              data.ownerEmail?.trim() ||
              `${data.ownerName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@hostelos.com`,
            propertyName: data.name.trim(),
            address: data.address,
            city: data.city || 'Mumbai',
            image: createdProperty.image,
            totalRooms: createdProperty.totalRooms,
            totalBeds: createdProperty.totalBeds,
            occupiedBeds: 0,
            portalPassword: 'Hostel@2026',
            status: data.status || 'active',
            joinedDate: new Date().toISOString().split('T')[0],
          };
          localStorage.setItem(CUSTOM_ADMINS_KEY, JSON.stringify([newAdmin, ...customAdmins]));
        }
      } catch (e) {
        console.warn('Could not auto-link admin in storage:', e);
      }
    }

    return createdProperty;
  },

  async updateProperty(
    id: string | number,
    data: Partial<Property>
  ): Promise<any> {
    const rawId = typeof id === 'string' && id.startsWith('PROP-') ? parseInt(id.replace('PROP-', ''), 10) : id;

    try {
      await apiClient.patch(`/properties/${rawId}`, {
        name: data.name,
        address: data.address,
      });
    } catch {
      // offline fallback
    }

    // Update in localStorage if present
    const customProps = getStoredCustomProperties();
    const updated = customProps.map((p) =>
      p.id === id || p.id === `PROP-${id}` ? { ...p, ...data } : p
    );
    localStorage.setItem(CUSTOM_PROPERTIES_KEY, JSON.stringify(updated));

    return { id, ...data };
  },

  async updatePropertyStatus(
    id: string | number,
    status: 'active' | 'inactive'
  ): Promise<any> {
    const rawId = typeof id === 'string' && id.startsWith('PROP-') ? parseInt(id.replace('PROP-', ''), 10) : id;

    try {
      await apiClient.patch(`/properties/${rawId}/status`, {
        status: status.toUpperCase(),
      });
    } catch {
      // offline fallback
    }

    const customProps = getStoredCustomProperties();
    const updated = customProps.map((p) =>
      p.id === id || p.id === `PROP-${id}` ? { ...p, status } : p
    );
    localStorage.setItem(CUSTOM_PROPERTIES_KEY, JSON.stringify(updated));

    return { id, status };
  },
};
