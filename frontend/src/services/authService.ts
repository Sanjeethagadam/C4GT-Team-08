import { apiClient } from './apiClient';

export interface LoginCredentials {
  username: string;
  password?: string; // Some endpoints might use other auth methods, but we need password here
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    username: string;
    role: 'STUDENT' | 'CTPO' | 'HOD' | 'PRINCIPAL' | 'COORDINATOR' | 'ADMIN';
    email?: string;
    firstName?: string;
    lastName?: string;
    scope?: {
      campusId?: string;
      branchId?: string;
      sectionId?: string;
      year?: number;
    };
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').replace('/v1', '');
    const response = await apiClient.post(`${baseURL}/auth/login`, credentials);
    // Based on backend { success, message, data: { token, user } }
    return response.data;
  },

  async logout(username: string): Promise<void> {
    const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').replace('/v1', '');
    await apiClient.post(`${baseURL}/auth/logout`, { username }).catch(() => {});
  },

  async validateToken(): Promise<AuthResponse> {
    const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').replace('/v1', '');
    const response = await apiClient.get(`${baseURL}/auth/me`);
    return response.data;
  },
};
