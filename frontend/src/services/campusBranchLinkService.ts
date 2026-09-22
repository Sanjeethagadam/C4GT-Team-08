import { apiClient } from './apiClient';
import type { Campus } from './campusService';
import type { Branch } from './branchService';

export interface CampusBranchLink {
  _id: string;
  campusId: Campus | string;
  branchId: Branch | string;
  isAvailable: boolean;
}

const getBase = () => apiClient.defaults.baseURL?.replace('/v1', '') || '/api';

export const campusBranchLinkService = {
  async getAllLinks(filters?: any): Promise<CampusBranchLink[]> {
    const response = await apiClient.get(`${getBase()}/campus-branch-availability`, { params: filters });
    return response.data;
  },
  
  async createLink(data: { campusId: string; branchId: string; isAvailable?: boolean }): Promise<CampusBranchLink> {
    const response = await apiClient.post(`${getBase()}/campus-branch-availability`, data);
    return response.data;
  },
  
  async updateLink(id: string, data: Partial<CampusBranchLink>): Promise<CampusBranchLink> {
    // Note: The backend route uses .patch() for updates
    const response = await apiClient.patch(`${getBase()}/campus-branch-availability/${id}`, data);
    return response.data;
  },
  
  async deleteLink(id: string): Promise<void> {
    await apiClient.delete(`${getBase()}/campus-branch-availability/${id}`);
  }
};
