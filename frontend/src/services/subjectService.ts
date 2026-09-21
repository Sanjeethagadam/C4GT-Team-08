import { apiClient } from './apiClient';
import type { Section } from './sectionService';

const getBase = () => apiClient.defaults.baseURL?.replace('/v1', '') || '/api';

export interface Subject {
  _id: string;
  subjectName: string;
  subjectCode: string;
  sectionId: Section | string;
}

export const subjectService = {
  async getAllSubjects(filters?: any): Promise<any[]> {
    const response = await apiClient.get(`${getBase()}/subjects`, { params: filters });
    return response.data;
  },
  
  async createSubject(data: any): Promise<any> {
    const response = await apiClient.post(`${getBase()}/subjects`, data);
    return response.data;
  },
  
  async updateSubject(id: string, data: any): Promise<any> {
    const response = await apiClient.put(`${getBase()}/subjects/${id}`, data);
    return response.data;
  },
  
  async deleteSubject(id: string): Promise<void> {
    await apiClient.delete(`${getBase()}/subjects/${id}`);
  }
};
