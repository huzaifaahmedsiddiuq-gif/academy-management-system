import { NotificationService } from '../services/NotificationService.js';

export const getMyNotifications = async (req, res, next) => {
  try {
    const data = await NotificationService.getForUser(req.user.id);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

export const markRead = async (req, res, next) => {
  try {
    await NotificationService.markAsRead(req.params.id, req.user.id);
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    next(err);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    await NotificationService.markAllAsRead(req.user.id);
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
};
