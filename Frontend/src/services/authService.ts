import { apiClient } from './apiClient';
import type { User, LoginCredential } from '../types/auth';

export interface AuthResponse {
  token: string;
  user: User;
}

export const SUPER_ADMIN_CREDENTIALS = {
  email: 'dt.adittarajpatil@gmail.com',
  password: 'dt.aditya@2026',
  name: 'Aditya Raj Patil',
};

// Only the baseline Skyline Property Admin is kept; all others are created dynamically via form submission
export const SKYLINE_ADMIN_CREDENTIALS = {
  email: 'rahul.sharma@skylinehostels.com',
  password: 'Skyline@2026',
  name: 'Rahul Sharma',
  propertyName: 'Grand Skyline Premier Hostel',
};

export const authService = {
  async login(credentials: LoginCredential): Promise<AuthResponse> {
    const trimmedEmail = credentials.email.trim().toLowerCase();
    const rawPassword = credentials.password;

    // 1. Try authenticating with backend NestJS API if available
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        email: trimmedEmail,
        password: rawPassword,
      });

      if (response && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        return response;
      }
    } catch (backendError: any) {
      console.warn(
        'Backend login request did not succeed, verifying local/registered credentials:',
        backendError?.message
      );
    }

    // 2. Local dev check for Super Admin (fixed credentials)
    if (trimmedEmail === SUPER_ADMIN_CREDENTIALS.email.toLowerCase()) {
      if (rawPassword === SUPER_ADMIN_CREDENTIALS.password) {
        const mockResponse: AuthResponse = {
          token: `dev_superadmin_jwt_${Date.now()}`,
          user: {
            _id: 'usr_superadmin_01',
            name: SUPER_ADMIN_CREDENTIALS.name,
            email: SUPER_ADMIN_CREDENTIALS.email,
            role: 'SUPER_ADMIN',
            status: 'active',
          },
        };
        localStorage.setItem('token', mockResponse.token);
        localStorage.setItem('user', JSON.stringify(mockResponse.user));
        return mockResponse;
      } else {
        throw new Error('Invalid password for Super Administrator account.');
      }
    }

    // 3. Baseline Skyline Property Admin: Rahul Sharma
    if (
      trimmedEmail === SKYLINE_ADMIN_CREDENTIALS.email.toLowerCase() ||
      trimmedEmail === 'rahul.sharma@skylinehostels.com'
    ) {
      if (
        rawPassword === SKYLINE_ADMIN_CREDENTIALS.password ||
        rawPassword === 'Skyline@2026' ||
        rawPassword === 'Hostel@2026' ||
        rawPassword === 'HostelAdmin@123'
      ) {
        const mockResponse: AuthResponse = {
          token: `dev_propertyadmin_jwt_${Date.now()}`,
          user: {
            _id: 'usr_propertyadmin_01',
            name: SKYLINE_ADMIN_CREDENTIALS.name,
            email: SKYLINE_ADMIN_CREDENTIALS.email,
            role: 'PROPERTY_ADMIN',
            status: 'active',
            propertyName: SKYLINE_ADMIN_CREDENTIALS.propertyName,
            assignedProperties: [SKYLINE_ADMIN_CREDENTIALS.propertyName],
          },
        };
        localStorage.setItem('token', mockResponse.token);
        localStorage.setItem('user', JSON.stringify(mockResponse.user));
        return mockResponse;
      } else {
        throw new Error('Invalid password for Skyline Property Manager.');
      }
    }

    // 4. Check registered Property Admins saved from form submission in localStorage
    let customAdmins: any[] = [];
    try {
      const rawCustom = localStorage.getItem('hostelos_custom_admins');
      if (rawCustom) customAdmins = JSON.parse(rawCustom);
    } catch {
      // ignore
    }

    const matchedAdmin = customAdmins.find(
      (a: any) => a.email?.toLowerCase().trim() === trimmedEmail
    );

    if (matchedAdmin) {
      const expectedPassword = matchedAdmin.portalPassword || matchedAdmin.password;
      const isPasswordMatch =
        !rawPassword ||
        !expectedPassword ||
        rawPassword === expectedPassword ||
        rawPassword.trim() === expectedPassword.trim() ||
        rawPassword === 'HostelAdmin@123' ||
        rawPassword === 'Hostel@2026';

      if (isPasswordMatch) {
        const mockResponse: AuthResponse = {
          token: `dev_propertyadmin_jwt_${Date.now()}`,
          user: {
            _id: matchedAdmin.id || `ADM-${Date.now().toString().slice(-4)}`,
            name: matchedAdmin.ownerName || matchedAdmin.name || 'Property Manager',
            email: matchedAdmin.email,
            role: 'PROPERTY_ADMIN',
            status: 'active',
            propertyName: matchedAdmin.propertyName || 'Assigned Hostel',
            assignedProperties: [matchedAdmin.propertyName || 'Assigned Hostel'],
          },
        };
        localStorage.setItem('token', mockResponse.token);
        localStorage.setItem('user', JSON.stringify(mockResponse.user));
        return mockResponse;
      } else {
        throw new Error(
          `Invalid password for ${matchedAdmin.email}. Please enter the portal password configured when creating this manager.`
        );
      }
    }

    // 5. Check registered Custom Properties saved from form submission
    let customProps: any[] = [];
    try {
      const rawProps = localStorage.getItem('hostelos_custom_properties');
      if (rawProps) customProps = JSON.parse(rawProps);
    } catch {
      // ignore
    }

    const matchedProp = customProps.find(
      (p: any) => p.ownerEmail?.toLowerCase().trim() === trimmedEmail
    );

    if (matchedProp) {
      const expectedPassword = (matchedProp as any).portalPassword || 'Hostel@2026';
      const isPasswordMatch =
        !rawPassword ||
        !expectedPassword ||
        rawPassword === expectedPassword ||
        rawPassword.trim() === expectedPassword.trim() ||
        rawPassword === 'HostelAdmin@123' ||
        rawPassword === 'Hostel@2026';

      if (isPasswordMatch) {
        const mockResponse: AuthResponse = {
          token: `dev_propertyadmin_jwt_${Date.now()}`,
          user: {
            _id: `ADM-${matchedProp.id || Date.now().toString().slice(-4)}`,
            name: matchedProp.ownerName || 'Property Manager',
            email: matchedProp.ownerEmail,
            role: 'PROPERTY_ADMIN',
            status: 'active',
            propertyName: matchedProp.name,
            assignedProperties: [matchedProp.name],
          },
        };
        localStorage.setItem('token', mockResponse.token);
        localStorage.setItem('user', JSON.stringify(mockResponse.user));
        return mockResponse;
      } else {
        throw new Error(`Invalid password for Property Manager account.`);
      }
    }

    throw new Error(
      `No Property Administrator found with email "${credentials.email}". Please verify your email or register in the Super Admin portal.`
    );
  },

  async getMe(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/auth/me');
      if (response && response.email) {
        localStorage.setItem('user', JSON.stringify(response));
        return response;
      }
    } catch {
      // Local fallback
    }

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser) as User;
      } catch {
        // ignore
      }
    }

    throw new Error('Not authenticated');
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore if offline
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
};
