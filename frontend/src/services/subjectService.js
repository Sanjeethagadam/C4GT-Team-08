import { apiClient } from "./apiClient";

const getBase = () => apiClient.defaults.baseURL?.replace("/v1", "") || "/api";

export const subjectService = {
  async getAllSubjects(filters) {
    const response = await apiClient.get(`${getBase()}/subjects`, {
      params: filters,
    });
    return response.data;
  },
  async createSubject(data) {
    const response = await apiClient.post(`${getBase()}/subjects`, data);
    return response.data;
  },
  async updateSubject(id, data) {
    const response = await apiClient.put(`${getBase()}/subjects/${id}`, data);
    return response.data;
  },
  async deleteSubject(id) {
    await apiClient.delete(`${getBase()}/subjects/${id}`);
  },
};
