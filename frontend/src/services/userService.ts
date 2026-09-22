import { apiClient } from './apiClient';
import type { Student } from './studentService';

export interface User {
  _id: string;
  username: string;
  role: string;
  firstName?: string;
  lastName?: string;
  studentId?: Student | string;
  status?: string;
  scope?: any;
}

const getBase = () => apiClient.defaults.baseURL?.replace('/v1', '') || '/api';

export const userService = {
  async getAllUsers(filters?: any): Promise<User[]> {
    const response = await apiClient.get(`${getBase()}/users`, { params: filters });
    return response.data;
  },
  
  async createUser(data: Partial<User> & { password?: string }): Promise<User> {
    const response = await apiClient.post(`${getBase()}/users`, data);
    return response.data;
  },
  
  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await apiClient.patch(`${getBase()}/users/${id}`, data);
    return response.data;
  },
  
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`${getBase()}/users/${id}`);
  }
};
