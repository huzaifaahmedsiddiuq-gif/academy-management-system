import db from '../database/index.js';

export class NotificationService {
  static async getForUser(userId) {
    const res = await db.query(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT 50
    `, [userId]);

    const countRes = await db.query(`
      SELECT COUNT(*) as unread_count FROM notifications
      WHERE user_id = ? AND is_read = FALSE
    `, [userId]);

    return {
      notifications: res.rows || [],
      unreadCount: Number(countRes.rows[0]?.unread_count || 0)
    };
  }

  static async markAsRead(id, userId) {
    await db.query(`
      UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?
    `, [id, userId]);
    return { success: true };
  }

  static async markAllAsRead(userId) {
    await db.query(`
      UPDATE notifications SET is_read = TRUE WHERE user_id = ?
    `, [userId]);
    return { success: true };
  }

  static async create({ userId, title, message, type = 'general', link = '' }) {
    const res = await db.query(`
      INSERT INTO notifications (user_id, title, message, type, link)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, title, message, type, link]);
    return { success: true, notificationId: res.insertId };
  }
}
