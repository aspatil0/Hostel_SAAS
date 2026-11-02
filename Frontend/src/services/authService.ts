import { apiClient } from './apiClient';
import type { User, LoginCredential } from '../types/auth';

export interface AuthResponse {
  token: string;
  user: User;
}

// 1. Only Super Admin has a fixed root account
export const SUPER_ADMIN_CREDENTIALS = {
  email: 'dt.adittarajpatil@gmail.com',
  password: 'dt.aditya@2026',
  name: 'Aditya Raj Patil',
};

// Default sample student credentials for login page prefill / dev demo
export const STUDENT_CREDENTIALS = {
  email: 'aarav.mehta@gmail.com',
  password: 'Student@2026',
  name: 'Aarav Mehta',
  studentCode: 'STU-01',
  propertyName: 'Grand Skyline Premier Hostel',
  roomNumber: '101',
  bedNumber: 'Bed A',
};

export const authService = {
  async login(credentials: LoginCredential): Promise<AuthResponse> {
    const trimmedEmail = credentials.email.trim().toLowerCase();
    const rawPassword = credentials.password;

    // 1. Primary: Authenticate against backend NestJS + MySQL database
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

    // 2. Fixed root credentials for Super Admin ONLY
    if (trimmedEmail === SUPER_ADMIN_CREDENTIALS.email.toLowerCase()) {
      if (rawPassword === SUPER_ADMIN_CREDENTIALS.password) {
        const mockResponse: AuthResponse = {
          token: `dev_superadmin_jwt_${Date.now()}`,
          user: {
            _id: 'usr_superadmin_01',
            name: SUPER_ADMIN_CREDENTIALS.name,
            email: trimmedEmail,
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

    // 3. Property Admins created by Super Admin (persisted in custom admins store)
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
      // Must match the password created by the Super Admin in the dashboard form
      const expectedPassword = matchedAdmin.portalPassword || matchedAdmin.password;
      if (expectedPassword && rawPassword === expectedPassword) {
        const mockResponse: AuthResponse = {
          token: `dev_propertyadmin_jwt_${Date.now()}`,
          user: {
            _id: matchedAdmin.id || `ADM-${Date.now().toString().slice(-4)}`,
            name: matchedAdmin.ownerName || matchedAdmin.name || 'Property Admin',
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
        throw new Error('Incorrect password for this Property Admin account.');
      }
    }

    // 4. Students created by Property Admin (persisted in portal store / registered students)
    let customStudents: any[] = [];
    try {
      const rawStudents = localStorage.getItem('hostelos_custom_students');
      if (rawStudents) customStudents = JSON.parse(rawStudents);
    } catch {
      // ignore
    }

    const matchedStudent = customStudents.find(
      (s: any) => s.email?.toLowerCase().trim() === trimmedEmail
    );

    if (matchedStudent) {
      // Must match the password provisioned by Property Admin (e.g. Student@2026 or configured pass)
      const expectedPassword = matchedStudent.password || matchedStudent.tempPassword || 'Student@2026';
      if (rawPassword === expectedPassword) {
        const mockResponse: AuthResponse = {
          token: `dev_student_jwt_${Date.now()}`,
          user: {
            _id: matchedStudent.id || `STU-${Date.now().toString().slice(-4)}`,
            name: matchedStudent.name || 'Student Resident',
            email: matchedStudent.email,
            role: 'STUDENT',
            status: 'active',
            studentCode: matchedStudent.studentCode || matchedStudent.id,
            propertyName: matchedStudent.propertyName || 'Hostel Resident',
            roomNumber: matchedStudent.roomNumber || '101',
            bedNumber: matchedStudent.bedNumber || 'Bed A',
            assignedProperties: [matchedStudent.propertyName || 'Hostel Resident'],
          },
        };
        localStorage.setItem('token', mockResponse.token);
        localStorage.setItem('user', JSON.stringify(mockResponse.user));
        return mockResponse;
      } else {
        throw new Error('Incorrect password for this student account.');
      }
    }

    throw new Error('Invalid email or password. Please contact your property administrator.');
  },

  async getMe(): Promise<User> {
    try {
      const user = await apiClient.get<User>('/auth/me');
      if (user && user.email) {
        localStorage.setItem('user', JSON.stringify(user));
        return user;
      }
    } catch {
      // fallback to stored local user
    }

    const raw = localStorage.getItem('user');
    if (raw) {
      return JSON.parse(raw);
    }
    throw new Error('No active session');
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getCurrentUser(): User | null {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
