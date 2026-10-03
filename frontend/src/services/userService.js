import { apiClient } from "./apiClient";

const getBase = () => apiClient.defaults.baseURL?.replace("/v1", "") || "/api";

export const userService = {
  async getAllUsers(filters) {
    const response = await apiClient.get(`${getBase()}/users`, {
      params: filters,
    });
    return response.data;
  },
  async createUser(data) {
    const response = await apiClient.post(`${getBase()}/users`, data);
    return response.data;
  },
  async updateUser(id, data) {
    const response = await apiClient.patch(`${getBase()}/users/${id}`, data);
    return response.data;
  },
  async deleteUser(id) {
    await apiClient.delete(`${getBase()}/users/${id}`);
  },
};
