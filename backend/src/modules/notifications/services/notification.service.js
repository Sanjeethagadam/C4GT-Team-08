const Notification = require('../models/Notification');

class NotificationService {
  async createNotification(data) {
    const notification = new Notification(data);
    return await notification.save();
  }

  async createBulkNotifications(dataArray) {
    if (!dataArray || dataArray.length === 0) return [];
    return await Notification.insertMany(dataArray);
  }

  async getUserNotifications(userId, filters = {}) {
    const query = { recipientUserId: userId, ...filters };
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).lean();
    
    // Attach Notice details if needed
    const noticeIds = notifications.filter(n => n.referenceType === 'Notice').map(n => n.referenceId);
    if (noticeIds.length > 0) {
      const Notice = require('../models/Notice');
      const notices = await Notice.find({ _id: { $in: noticeIds } }).select('documentPath videoUrl').lean();
      const noticeMap = {};
      notices.forEach(n => noticeMap[n._id.toString()] = n);
      
      notifications.forEach(n => {
        if (n.referenceType === 'Notice' && noticeMap[n.referenceId?.toString()]) {
          n.noticeDetails = noticeMap[n.referenceId.toString()];
        }
      });
    }
    return notifications;
  }

  async getUnreadCount(userId) {
    return await Notification.countDocuments({ recipientUserId: userId, isRead: false });
  }

  async markAsRead(notificationId, userId) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, recipientUserId: userId },
      { isRead: true },
      { new: true }
    );
  }

  async markAllAsRead(userId) {
    return await Notification.updateMany(
      { recipientUserId: userId, isRead: false },
      { isRead: true }
    );
  }
}

module.exports = new NotificationService();
