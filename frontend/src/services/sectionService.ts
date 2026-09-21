import { apiClient } from './apiClient';
import type { Semester } from './academicConfigService';

export interface Section {
  _id: string;
  semesterId: Semester | string;
  sectionName: string;
  name?: string;
}

const getBase = () => apiClient.defaults.baseURL?.replace('/v1', '') || '/api';

export const sectionService = {
  async getAllSections(filters?: any): Promise<Section[]> {
    const response = await apiClient.get(`${getBase()}/sections`, { params: filters });
    return response.data;
  },
  
  async createSection(data: { semesterId: string; sectionName: string }): Promise<Section> {
    const response = await apiClient.post(`${getBase()}/sections`, data);
    return response.data;
  },
  
  async updateSection(id: string, data: Partial<Section>): Promise<Section> {
    const response = await apiClient.put(`${getBase()}/sections/${id}`, data);
    return response.data;
  },
  
  async deleteSection(id: string): Promise<void> {
    await apiClient.delete(`${getBase()}/sections/${id}`);
  }
};
