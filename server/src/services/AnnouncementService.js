import db from '../database/index.js';

export class AnnouncementService {
  static async getAll({ role = 'all', classId = null, isAdmin = false }) {
    let sql = `
      SELECT a.*, c.name as class_name, u.username as creator_name
      FROM announcements a
      LEFT JOIN classes c ON a.target_class_id = c.id
      LEFT JOIN users u ON a.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (!isAdmin) {
      sql += ` AND a.is_published = TRUE`;
      if (role !== 'admin') {
        sql += ` AND (a.target_role = 'all' OR a.target_role = ?)`;
        params.push(role);
      }
      if (classId) {
        sql += ` AND (a.target_class_id IS NULL OR a.target_class_id = ?)`;
        params.push(classId);
      }
    }

    sql += ` ORDER BY a.priority = 'urgent' DESC, a.priority = 'high' DESC, a.created_at DESC`;

    const res = await db.query(sql, params);
    return res.rows || [];
  }

  static async create(data, userId) {
    const { title, content, target_role, target_class_id, priority, is_published } = data;
    if (!title || !content) throw new Error('Title and content are required.');

    const res = await db.query(`
      INSERT INTO announcements (title, content, target_role, target_class_id, priority, is_published, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      title, content, target_role || 'all',
      target_class_id || null, priority || 'normal',
      is_published !== false, userId || null
    ]);

    return { success: true, message: 'Announcement created successfully.', announcementId: res.insertId };
  }

  static async update(id, data) {
    const { title, content, target_role, target_class_id, priority, is_published } = data;
    await db.query(`
      UPDATE announcements SET
        title = ?, content = ?, target_role = ?, target_class_id = ?,
        priority = ?, is_published = ?
      WHERE id = ?
    `, [title, content, target_role || 'all', target_class_id || null, priority || 'normal', is_published !== false, id]);

    return { success: true, message: 'Announcement updated successfully.' };
  }

  static async delete(id) {
    await db.query('DELETE FROM announcements WHERE id = ?', [id]);
    return { success: true, message: 'Announcement deleted successfully.' };
  }
}
