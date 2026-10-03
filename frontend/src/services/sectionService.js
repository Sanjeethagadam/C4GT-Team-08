import { apiClient } from "./apiClient";

const getBase = () => apiClient.defaults.baseURL?.replace("/v1", "") || "/api";

export const sectionService = {
  async getAllSections(filters) {
    const response = await apiClient.get(`${getBase()}/sections`, {
      params: filters,
    });
    return response.data;
  },
  async createSection(data) {
    const response = await apiClient.post(`${getBase()}/sections`, data);
    return response.data;
  },
  async updateSection(id, data) {
    const response = await apiClient.put(`${getBase()}/sections/${id}`, data);
    return response.data;
  },
  async deleteSection(id) {
    await apiClient.delete(`${getBase()}/sections/${id}`);
  },
};
