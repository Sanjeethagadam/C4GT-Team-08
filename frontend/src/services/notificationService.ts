import { apiClient } from './apiClient';

export interface Notification {
  _id: string;
  notificationType: 'BACKLOG' | 'REMEDIAL' | 'GUEST_LECTURE' | 'RISK' | 'RESULT_IMPORT' | 'SYSTEM' | string;
  title: string;
  message: string;
  isRead: boolean;
  status?: string; // fallback if used
  createdAt: string;
  referenceType?: string;
  referenceId?: string;
  noticeDetails?: {
    documentPath?: string;
    videoUrl?: string;
  };
}

export const notificationService = {
  async getAllNotifications(filters?: any): Promise<Notification[]> {
    const response = await apiClient.get('/notifications', { params: filters });
    return response.data;
  },
  
  async markAsRead(id: string): Promise<Notification> {
    const response = await apiClient.put(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead(): Promise<any> {
    const response = await apiClient.put('/notifications/mark-all-read');
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data.count;
  }
};
