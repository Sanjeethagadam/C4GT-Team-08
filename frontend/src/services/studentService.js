import { apiClient } from "./apiClient";

const getBase = () => apiClient.defaults.baseURL?.replace("/v1", "") || "/api";

export const studentService = {
  async getAllStudents(filters) {
    const response = await apiClient.get(`${getBase()}/students`, {
      params: filters,
    });
    return response.data;
  },

  async getProfile() {
    const response = await apiClient.get(`${getBase()}/students/me`);
    return response.data;
  },
  async createStudent(data) {
    const response = await apiClient.post(`${getBase()}/students`, data);
    return response.data;
  },
  async updateStudent(id, data) {
    const response = await apiClient.put(`${getBase()}/students/${id}`, data);
    return response.data;
  },
  async deleteStudent(id) {
    await apiClient.delete(`${getBase()}/students/${id}`);
  },
};
