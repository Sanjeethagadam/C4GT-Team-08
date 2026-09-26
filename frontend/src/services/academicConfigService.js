import { apiClient } from "./apiClient";

const getBase = () => apiClient.defaults.baseURL?.replace("/v1", "") || "/api";

export const academicConfigService = {
  async getAllAcademicYears(filters) {
    const response = await apiClient.get(`${getBase()}/academic-years`, {
      params: filters,
    });
    return response.data;
  },
  async createAcademicYear(data) {
    const response = await apiClient.post(`${getBase()}/academic-years`, data);
    return response.data;
  },

  async updateAcademicYear(id, data) {
    const response = await apiClient.patch(
      `${getBase()}/academic-years/${id}`,
      data,
    );
    return response.data;
  },

  async getAllSemesters(filters) {
    const response = await apiClient.get(`${getBase()}/semesters`, {
      params: filters,
    });
    return response.data;
  },
  async createSemester(data) {
    const response = await apiClient.post(`${getBase()}/semesters`, data);
    return response.data;
  },

  async updateSemester(id, data) {
    const response = await apiClient.patch(`${getBase()}/semesters/${id}`, data);
    return response.data;
  },
};
