import db from '../database/index.js';

export class StudyMaterialService {
  static async getAll({ classId = '', subjectId = '', materialType = '', search = '' }) {
    let sql = `
      SELECT sm.*, c.name as class_name, sub.name as subject_name, t.full_name as teacher_name
      FROM study_material sm
      JOIN classes c ON sm.class_id = c.id
      JOIN subjects sub ON sm.subject_id = sub.id
      LEFT JOIN teachers t ON sm.teacher_id = t.id
      WHERE 1=1
    `;
    const params = [];

    if (classId) {
      sql += ` AND sm.class_id = ?`;
      params.push(classId);
    }

    if (subjectId) {
      sql += ` AND sm.subject_id = ?`;
      params.push(subjectId);
    }

    if (materialType) {
      sql += ` AND sm.material_type = ?`;
      params.push(materialType);
    }

    if (search) {
      sql += ` AND (sm.title LIKE ? OR sm.chapter LIKE ? OR sm.topic LIKE ? OR sm.description LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ` ORDER BY sm.id DESC`;

    const res = await db.query(sql, params);
    return res.rows || [];
  }

  static async create(data) {
    const { class_id, subject_id, teacher_id, title, chapter, topic, material_type, file_url, video_url, description } = data;
    if (!class_id || !subject_id || !title) {
      throw new Error('Class, Subject, and Title are required.');
    }

    const res = await db.query(`
      INSERT INTO study_material (class_id, subject_id, teacher_id, title, chapter, topic, material_type, file_url, video_url, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      class_id, subject_id, teacher_id || null, title,
      chapter || '', topic || '', material_type || 'pdf',
      file_url || '', video_url || '', description || ''
    ]);

    return { success: true, message: 'Study material uploaded successfully.', materialId: res.insertId };
  }

  static async update(id, data) {
    const { class_id, subject_id, title, chapter, topic, material_type, file_url, video_url, description } = data;
    await db.query(`
      UPDATE study_material SET
        class_id = ?, subject_id = ?, title = ?, chapter = ?, topic = ?,
        material_type = ?, file_url = ?, video_url = ?, description = ?
      WHERE id = ?
    `, [class_id, subject_id, title, chapter, topic, material_type, file_url, video_url, description, id]);

    return { success: true, message: 'Study material updated successfully.' };
  }

  static async delete(id) {
    await db.query('DELETE FROM study_material WHERE id = ?', [id]);
    return { success: true, message: 'Study material deleted successfully.' };
  }
}
