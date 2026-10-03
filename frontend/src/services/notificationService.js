import { apiClient } from "./apiClient";

export const notificationService = {
  async getAllNotifications(filters) {
    const response = await apiClient.get("/notifications", { params: filters });
    return response.data;
  },
  async markAsRead(id) {
    const response = await apiClient.put(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await apiClient.put("/notifications/mark-all-read");
    return response.data;
  },

  async getUnreadCount() {
    const response = await apiClient.get("/notifications/unread-count");
    return response.data.count;
  },
};
