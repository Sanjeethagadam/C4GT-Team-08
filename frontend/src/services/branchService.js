import { apiClient } from "./apiClient";

const getBase = () => apiClient.defaults.baseURL?.replace("/v1", "") || "/api";

export const branchService = {
  async getAllBranches(filters) {
    const response = await apiClient.get(`${getBase()}/branches`, {
      params: filters,
    });
    return response.data;
  },

  async getCampusBranchAvailability(filters) {
    const response = await apiClient.get(
      `${getBase()}/campus-branch-availability`,
      { params: filters },
    );
    return response.data;
  },
  async createBranch(data) {
    const response = await apiClient.post(`${getBase()}/branches`, data);
    return response.data;
  },
  async updateBranch(id, data) {
    const response = await apiClient.patch(`${getBase()}/branches/${id}`, data);
    return response.data;
  },
  async deleteBranch(id) {
    await apiClient.delete(`${getBase()}/branches/${id}`);
  },
};
