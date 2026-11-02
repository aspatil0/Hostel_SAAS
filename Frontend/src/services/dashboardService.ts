import { apiClient } from './apiClient';
import { initialProperties, initialPropertyAdmins } from '../data/mockData';

export interface DashboardSummary {
  totalProperties: number;
  activeProperties: number;
  inactiveProperties: number;
  totalAdmins: number;
  activeAdmins: number;
  inactiveAdmins: number;
  recentProperties: Array<{
    id: string;
    name: string;
    city: string;
    rooms: number;
    beds: number;
    admin: string;
    status: 'active' | 'inactive';
  }>;
  recentAdmins: Array<{
    id: string;
    name: string;
    email: string;
    property: string;
    status: 'active' | 'inactive';
    joined: string;
  }>;
}

export const dashboardService = {
  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      const summary = await apiClient.get<DashboardSummary>('/properties/stats/summary');
      if (summary && typeof summary.totalProperties === 'number') {
        return summary;
      }
    } catch {
      // Fallback calculation using local store
    }

    const activeProperties = initialProperties.filter((p) => p.status === 'active').length;
    const activeAdmins = initialPropertyAdmins.filter((a) => a.status === 'active').length;

    return {
      totalProperties: initialProperties.length,
      activeProperties,
      inactiveProperties: initialProperties.length - activeProperties,
      totalAdmins: initialPropertyAdmins.length,
      activeAdmins,
      inactiveAdmins: initialPropertyAdmins.length - activeAdmins,
      recentProperties: initialProperties.map((p) => ({
        id: p.id,
        name: p.name,
        city: p.city,
        rooms: p.totalRooms,
        beds: p.totalBeds,
        admin: p.ownerName,
        status: p.status,
      })),
      recentAdmins: initialPropertyAdmins.map((a) => ({
        id: a.id,
        name: a.ownerName,
        email: a.email,
        property: a.propertyName,
        status: a.status,
        joined: a.joinedDate,
      })),
    };
  },
};
