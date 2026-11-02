export type UserRole = 'SUPER_ADMIN' | 'PROPERTY_ADMIN' | 'STUDENT';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  propertyName?: string;
  assignedProperties?: string[];
  studentCode?: string;
  roomNumber?: string;
  bedNumber?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredential) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredential {
  email: string;
  password: string;
}
