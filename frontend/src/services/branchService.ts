import { apiClient } from './apiClient';

const getBase = () => apiClient.defaults.baseURL?.replace('/v1', '') || '/api';

export interface Branch {
  _id: string;
  name: string;
  code: string;
  status: string;
}

export const branchService = {
  async getAllBranches(filters?: any): Promise<Branch[]> {
    const response = await apiClient.get(`${getBase()}/branches`, { params: filters });
    return response.data;
  },

  async getCampusBranchAvailability(filters?: any): Promise<any[]> {
    const response = await apiClient.get(`${getBase()}/campus-branch-availability`, { params: filters });
    return response.data;
  },
  
  async createBranch(data: Partial<Branch>): Promise<Branch> {
    const response = await apiClient.post(`${getBase()}/branches`, data);
    return response.data;
  },
  
  async updateBranch(id: string, data: Partial<Branch>): Promise<Branch> {
    const response = await apiClient.patch(`${getBase()}/branches/${id}`, data);
    return response.data;
  },
  
  async deleteBranch(id: string): Promise<void> {
    await apiClient.delete(`${getBase()}/branches/${id}`);
  }
};
