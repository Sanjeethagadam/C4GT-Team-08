import { apiClient } from "./apiClient";

const getBase = () => apiClient.defaults.baseURL?.replace("/v1", "") || "/api";

export const campusBranchLinkService = {
  async getAllLinks(filters) {
    const response = await apiClient.get(
      `${getBase()}/campus-branch-availability`,
      { params: filters },
    );
    return response.data;
  },
  async createLink(data) {
    const response = await apiClient.post(
      `${getBase()}/campus-branch-availability`,
      data,
    );
    return response.data;
  },
  async updateLink(id, data) {
    // Note: The backend route uses .patch() for updates
    const response = await apiClient.patch(
      `${getBase()}/campus-branch-availability/${id}`,
      data,
    );
    return response.data;
  },
  async deleteLink(id) {
    await apiClient.delete(`${getBase()}/campus-branch-availability/${id}`);
  },
};
