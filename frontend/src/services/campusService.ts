import { apiClient } from './apiClient';

export interface Campus {
  _id: string;
  name: string;
  code: string;
  location?: string;
  status?: string;
}

const getBase = () => apiClient.defaults.baseURL?.replace('/v1', '') || '/api';

export const campusService = {
  async getAllCampuses(filters?: any): Promise<Campus[]> {
    const response = await apiClient.get(`${getBase()}/campuses`, { params: filters });
    return response.data;
  },
  
  async createCampus(data: Partial<Campus>): Promise<Campus> {
    const response = await apiClient.post(`${getBase()}/campuses`, data);
    return response.data;
  },
  
  async updateCampus(id: string, data: Partial<Campus>): Promise<Campus> {
    const response = await apiClient.patch(`${getBase()}/campuses/${id}`, data);
    return response.data;
  },
  
  async deleteCampus(id: string): Promise<void> {
    await apiClient.delete(`${getBase()}/campuses/${id}`);
  }
};
