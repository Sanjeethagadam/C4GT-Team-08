import { apiClient } from "./apiClient";

export const systemConfigService = {
  async getAllRiskThresholds(filters) {
    const response = await apiClient.get("/results-backlogs/risk/config", {
      params: filters,
    });
    return response.data;
  },
  async updateRiskThreshold(_id, data) {
    // Note: The backend uses POST for /config rather than PUT /config/:id based on risk.routes.js
    const response = await apiClient.post(
      "/results-backlogs/risk/config",
      data,
    );
    return response.data;
  },
};
