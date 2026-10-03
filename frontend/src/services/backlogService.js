import { apiClient } from "./apiClient";

export const backlogService = {
  async getBacklogStudents(filters) {
    const response = await apiClient.get(
      "/results-backlogs/backlogs/students",
      { params: filters },
    );
    return {
      data: response.data || [],
      pagination: response.pagination || { total: 0, page: 1, limit: 50 },
    };
  },
};
