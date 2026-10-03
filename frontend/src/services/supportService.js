import { apiClient } from "./apiClient";

export const supportService = {
  async getMyRemedialClasses() {
    const response = await apiClient.get(
      "/academic-support/remedial-classes/student",
    );
    return response.data;
  },

  async getMyGuestLectures() {
    const response = await apiClient.get(
      "/academic-support/guest-lectures/student",
    );
    return response.data;
  },
};
