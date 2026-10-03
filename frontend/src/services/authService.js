import { apiClient } from "./apiClient";

export const authService = {
  async login(credentials) {
    const baseURL = (
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1"
    ).replace("/v1", "");
    const response = await apiClient.post(`${baseURL}/auth/login`, credentials);
    // Based on backend { success, message, data: { token, user } }
    return response.data;
  },

  async logout(username) {
    const baseURL = (
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1"
    ).replace("/v1", "");
    await apiClient
      .post(`${baseURL}/auth/logout`, { username })
      .catch(() => {});
  },

  async validateToken() {
    const baseURL = (
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1"
    ).replace("/v1", "");
    const response = await apiClient.get(`${baseURL}/auth/me`);
    return response.data;
  },

  async updateProfile(data) {
    const baseURL = (
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1"
    ).replace("/v1", "");
    const isFormData = data instanceof FormData;
    const response = await apiClient.put(`${baseURL}/auth/profile`, data, {
      headers: isFormData
        ? { "Content-Type": "multipart/form-data" }
        : undefined,
    });
    return response.data;
  },
};
