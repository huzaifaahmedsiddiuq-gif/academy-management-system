import db from '../database/index.js';

export class ClassService {
  static async getAllClasses() {
    const res = await db.query(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM students WHERE class_id = c.id AND status = 'active') as student_count,
        (SELECT COUNT(*) FROM class_subjects WHERE class_id = c.id) as subject_count
      FROM classes c
      ORDER BY c.id ASC
    `);
    return res.rows || [];
  }

  static async getClassById(id) {
    const classRes = await db.query('SELECT * FROM classes WHERE id = ?', [id]);
    if (!classRes.rows || classRes.rows.length === 0) throw new Error('Class not found');

    const subjectsRes = await db.query(`
      SELECT s.* FROM subjects s
      JOIN class_subjects cs ON s.id = cs.subject_id
      WHERE cs.class_id = ?
    `, [id]);

    const studentsRes = await db.query(`
      SELECT id, roll_number, full_name, phone, status
      FROM students WHERE class_id = ? ORDER BY roll_number ASC
    `, [id]);

    return {
      class: classRes.rows[0],
      subjects: subjectsRes.rows || [],
      students: studentsRes.rows || []
    };
  }

  static async createClass(data) {
    const { name, section, monthly_tuition_fee, description } = data;
    if (!name) throw new Error('Class name is required.');

    const res = await db.query(`
      INSERT INTO classes (name, section, monthly_tuition_fee, description)
      VALUES (?, ?, ?, ?)
    `, [name, section || 'A', monthly_tuition_fee || 5000, description || '']);

    return { success: true, message: 'Class created successfully.', classId: res.insertId };
  }

  static async updateClass(id, data) {
    const { name, section, monthly_tuition_fee, description } = data;
    await db.query(`
      UPDATE classes SET name = ?, section = ?, monthly_tuition_fee = ?, description = ?
      WHERE id = ?
    `, [name, section, monthly_tuition_fee, description, id]);

    return { success: true, message: 'Class updated successfully.' };
  }

  static async deleteClass(id) {
    // Check if students exist
    const s = await db.query('SELECT COUNT(*) as count FROM students WHERE class_id = ?', [id]);
    if (s.rows[0]?.count > 0) {
      throw new Error('Cannot delete class because it has enrolled students. Reassign or remove students first.');
    }
    await db.query('DELETE FROM classes WHERE id = ?', [id]);
    return { success: true, message: 'Class deleted successfully.' };
  }

  // --- SUBJECTS ---
  static async getAllSubjects() {
    const res = await db.query(`
      SELECT s.*, 
        (SELECT COUNT(*) FROM class_subjects WHERE subject_id = s.id) as classes_count
      FROM subjects s
      ORDER BY s.name ASC
    `);
    return res.rows || [];
  }

  static async createSubject(data) {
    const { name, code } = data;
    if (!name) throw new Error('Subject name is required.');
    const res = await db.query('INSERT INTO subjects (name, code) VALUES (?, ?)', [name, code || '']);
    return { success: true, message: 'Subject created successfully.', subjectId: res.insertId };
  }

  static async updateSubject(id, data) {
    const { name, code } = data;
    await db.query('UPDATE subjects SET name = ?, code = ? WHERE id = ?', [name, code, id]);
    return { success: true, message: 'Subject updated successfully.' };
  }

  static async deleteSubject(id) {
    await db.query('DELETE FROM subjects WHERE id = ?', [id]);
    return { success: true, message: 'Subject deleted successfully.' };
  }

  static async assignSubjectsToClass(classId, subjectIds) {
    await db.query('DELETE FROM class_subjects WHERE class_id = ?', [classId]);
    if (Array.isArray(subjectIds)) {
      for (const subId of subjectIds) {
        await db.query('INSERT INTO class_subjects (class_id, subject_id) VALUES (?, ?)', [classId, subId]);
      }
    }
    return { success: true, message: 'Subjects linked to class successfully.' };
  }
}
