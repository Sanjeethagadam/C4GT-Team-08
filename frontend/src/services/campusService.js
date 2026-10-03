import { apiClient } from "./apiClient";

const getBase = () => apiClient.defaults.baseURL?.replace("/v1", "") || "/api";

export const campusService = {
  async getAllCampuses(filters) {
    const response = await apiClient.get(`${getBase()}/campuses`, {
      params: filters,
    });
    return response.data;
  },
  async createCampus(data) {
    const response = await apiClient.post(`${getBase()}/campuses`, data);
    return response.data;
  },
  async updateCampus(id, data) {
    const response = await apiClient.patch(`${getBase()}/campuses/${id}`, data);
    return response.data;
  },
  async deleteCampus(id) {
    await apiClient.delete(`${getBase()}/campuses/${id}`);
  },
};
