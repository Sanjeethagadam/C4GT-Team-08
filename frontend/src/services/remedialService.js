import { apiClient } from "./apiClient";

export const remedialService = {
  async getEligibleStudents(params) {
    const response = await apiClient.get(
      "/academic-support/remedial-classes/eligible-students",
      { params },
    );
    return response.data;
  },

  async getAllRemedialClasses(filters) {
    const response = await apiClient.get("/academic-support/remedial-classes", {
      params: filters,
    });
    return response.data;
  },
  async createRemedialClass(data) {
    const response = await apiClient.post(
      "/academic-support/remedial-classes",
      data,
    );
    return response.data;
  },
  async updateRemedialClass(id, data) {
    const response = await apiClient.put(
      `/academic-support/remedial-classes/${id}`,
      data,
    );
    return response.data;
  },
  async deleteRemedialClass(id) {
    const response = await apiClient.delete(
      `/academic-support/remedial-classes/${id}`,
    );
    return response.data;
  },
};
