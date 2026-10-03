import { apiClient } from "./apiClient";

export const examinationService = {
  async getMyMarks() {
    const response = await apiClient.get("/examination/marks/student/me");
    return response.data;
  },

  async getAllMarks(filters) {
    const response = await apiClient.get("/examination/marks", {
      params: filters,
    });
    return response.data;
  },

  async getAllExaminations() {
    const response = await apiClient.get("/examination/examinations");
    return response.data;
  },

  async createMark(data) {
    const response = await apiClient.post("/examination/marks", data);
    return response.data;
  },

  async updateMark(id, data) {
    const response = await apiClient.put(`/examination/marks/${id}`, data);
    return response.data;
  },

  async getCtpoAssignments() {
    const response = await apiClient.get("/examination/ctpo-assignments");
    return response.data;
  },

  async getEvents() {
    const response = await apiClient.get("/examination/events");
    return response.data;
  },

  async getMarksDataset(assignmentId, examinationId) {
    const response = await apiClient.get("/examination/marks/dataset", {
      params: { assignmentId, examinationId },
    });
    return response.data;
  },

  async bulkEnterMarks(payload) {
    const response = await apiClient.post("/examination/marks/bulk", payload);
    return response.data;
  },
};
