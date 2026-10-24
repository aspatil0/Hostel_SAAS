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

export const PROPERTY_ADMIN_CREDENTIALS = {
  email: 'rahul.sharma@skylinehostels.com',
  password: 'Skyline@2026',
  name: 'Rahul Sharma',
  propertyName: 'Grand Skyline Premier Hostel',
};

export const authService = {
  async login(credentials: LoginCredential): Promise<AuthResponse> {
    const trimmedEmail = credentials.email.trim().toLowerCase();

    try {
      // 1. Try authenticating with backend NestJS API
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        email: trimmedEmail,
        password: credentials.password,
      });

      if (response && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        return response;
      }
    } catch (error: any) {
      // If backend responded with an explicit 401 Unauthorized, reject unless it matches fallback demo credentials
      if (
        error?.statusCode === 401 &&
        trimmedEmail !== SUPER_ADMIN_CREDENTIALS.email &&
        trimmedEmail !== PROPERTY_ADMIN_CREDENTIALS.email
      ) {
        throw new Error(error.message || 'Invalid email or password');
      }

      // 2. Local dev fallback for Super Admin
      if (
        trimmedEmail === SUPER_ADMIN_CREDENTIALS.email &&
        credentials.password === SUPER_ADMIN_CREDENTIALS.password
      ) {
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
      }

      // 3. Local dev fallback for Property Admin
      if (
        trimmedEmail === PROPERTY_ADMIN_CREDENTIALS.email &&
        credentials.password === PROPERTY_ADMIN_CREDENTIALS.password
      ) {
        const mockResponse: AuthResponse = {
          token: `dev_propertyadmin_jwt_${Date.now()}`,
          user: {
            _id: 'usr_propertyadmin_01',
            name: PROPERTY_ADMIN_CREDENTIALS.name,
            email: PROPERTY_ADMIN_CREDENTIALS.email,
            role: 'PROPERTY_ADMIN',
            status: 'active',
            assignedProperties: ['PROP-01'],
          },
        };

        localStorage.setItem('token', mockResponse.token);
        localStorage.setItem('user', JSON.stringify(mockResponse.user));
        return mockResponse;
      }

      // Re-throw meaningful error
      throw new Error(error.message || 'Invalid credentials or unable to reach auth server');
    }

    throw new Error('Invalid email or password');
  },

  async getMe(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/auth/me');
      if (response) {
        localStorage.setItem('user', JSON.stringify(response));
        return response;
      }
    } catch {
      // Return cached user if offline
      const cached = localStorage.getItem('user');
      if (cached) {
        return JSON.parse(cached) as User;
      }
    }

    throw new Error('User session expired');
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
};
