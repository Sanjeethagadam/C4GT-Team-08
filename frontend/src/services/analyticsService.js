import { apiClient } from "./apiClient";

export const analyticsService = {
  async getAcademicTrends(filters) {
    const response = await apiClient.get("/analytics/academic", {
      params: filters,
    });
    return response.data;
  },

  async getResultsDistribution(filters) {
    const response = await apiClient.get("/analytics/results", {
      params: filters,
    });
    return response.data;
  },

  async getBacklogsDistribution(filters) {
    const response = await apiClient.get("/analytics/backlogs", {
      params: filters,
    });
    return response.data;
  },

  async getRiskDistribution(filters) {
    const response = await apiClient.get("/analytics/risk", {
      params: filters,
    });
    return response.data;
  },

  async getRemedialStats(filters) {
    const response = await apiClient.get("/analytics/remedial", {
      params: filters,
    });
    return response.data;
  },

  async getGuestLectureStats(filters) {
    const response = await apiClient.get("/analytics/guest-lectures", {
      params: filters,
    });
    return response.data;
  },

  async getCampusKPIs(filters) {
    const response = await apiClient.get("/analytics/campus", {
      params: filters,
    });
    return response.data;
  },

  async getStudentPersonalAnalytics() {
    const response = await apiClient.get("/analytics/student/me");
    return response.data;
  },

  async getAdminDashboard() {
    const response = await apiClient.get("/analytics/admin-dashboard");
    return response.data;
  },

  async getBranchesPerformance(filters) {
    const response = await apiClient.get("/analytics/branches-performance", {
      params: filters,
    });
    return response.data;
  },

  async getYearsPerformance(filters) {
    const response = await apiClient.get("/analytics/years-performance", {
      params: filters,
    });
    return response.data;
  },
};
