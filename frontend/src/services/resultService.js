import { apiClient } from "./apiClient";

export const resultService = {
  async getMyResults() {
    const response = await apiClient.get("/results-backlogs/semester-results");
    return response.data;
  },
  async getMyBacklogs() {
    const response = await apiClient.get("/results-backlogs/backlogs");
    return response.data;
  },

  async getAllResults(filters) {
    const response = await apiClient.get("/results-backlogs/semester-results", {
      params: filters,
    });
    return response.data;
  },

  async getAllBacklogs(filters) {
    const response = await apiClient.get("/results-backlogs/backlogs", {
      params: filters,
    });
    return response.data;
  },

  async getAllRiskProfiles(filters) {
    const response = await apiClient.get("/results-backlogs/risk", {
      params: filters,
    });
    return response.data?.data || response.data;
  },
};
