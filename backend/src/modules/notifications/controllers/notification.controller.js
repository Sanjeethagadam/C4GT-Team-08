const notificationService = require('../services/notification.service');

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id; // depending on auth token payload structure
    const filters = {};
    if (req.query.isRead !== undefined) {
      filters.isRead = req.query.isRead === 'true';
    }
    const limit = parseInt(req.query.limit) || 50;
    
    // We only fetch notifications for the authenticated user, strictly scoped.
    const notifications = await notificationService.getUserNotifications(userId, filters);
    
    // In production we would paginate, but for now we just return top limit
    res.status(200).json({ status: 'success', data: notifications.slice(0, limit) });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch notifications' });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const count = await notificationService.getUnreadCount(userId);
    res.status(200).json({ status: 'success', data: { count } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch unread count' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;
    const notification = await notificationService.markAsRead(id, userId);
    
    if (!notification) {
      return res.status(404).json({ status: 'error', message: 'Notification not found or access denied' });
    }
    
    res.status(200).json({ status: 'success', data: notification });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to mark notification as read' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const result = await notificationService.markAllAsRead(userId);
    res.status(200).json({ status: 'success', data: result, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to mark all notifications as read' });
  }
};
