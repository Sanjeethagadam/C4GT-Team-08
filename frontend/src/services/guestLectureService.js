import { apiClient } from "./apiClient";

export const guestLectureService = {
  async getTargetStudents(params) {
    const response = await apiClient.get(
      "/academic-support/guest-lectures/target-students",
      { params },
    );
    return response.data;
  },

  async getAllGuestLectures(filters) {
    const response = await apiClient.get("/academic-support/guest-lectures", {
      params: filters,
    });
    return response.data;
  },
  async createGuestLecture(data) {
    const response = await apiClient.post(
      "/academic-support/guest-lectures",
      data,
    );
    return response.data;
  },
  async updateGuestLecture(id, data) {
    const response = await apiClient.put(
      `/academic-support/guest-lectures/${id}`,
      data,
    );
    return response.data;
  },
  async deleteGuestLecture(id) {
    const response = await apiClient.delete(
      `/academic-support/guest-lectures/${id}`,
    );
    return response.data;
  },
};
