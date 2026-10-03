import bcrypt from 'bcryptjs';
import db from '../database/index.js';

export class TeacherService {
  static async getAll() {
    const res = await db.query(`
      SELECT t.*, u.username, u.email as user_email,
        (SELECT COUNT(DISTINCT class_id) FROM teacher_classes WHERE teacher_id = t.id) as assigned_classes_count
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.id DESC
    `);
    return res.rows || [];
  }

  static async getById(id) {
    const res = await db.query(`
      SELECT t.*, u.username, u.email as user_email
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `, [id]);

    if (!res.rows || res.rows.length === 0) {
      throw new Error('Teacher not found.');
    }

    const teacher = res.rows[0];

    // Assigned classes & subjects
    const assignmentsRes = await db.query(`
      SELECT tc.id as assignment_id, c.id as class_id, c.name as class_name, c.section,
             s.id as subject_id, s.name as subject_name, s.code as subject_code
      FROM teacher_classes tc
      JOIN classes c ON tc.class_id = c.id
      JOIN subjects s ON tc.subject_id = s.id
      WHERE tc.teacher_id = ?
    `, [id]);

    return {
      teacher,
      assignments: assignmentsRes.rows || []
    };
  }

  static async create(data) {
    const {
      username, email, password, full_name, phone,
      qualification, specialization, salary, joining_date, avatar_url
    } = data;

    if (!username || !email || !password || !full_name) {
      throw new Error('Required fields: username, email, password, full_name');
    }

    const existing = await db.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.rows && existing.rows.length > 0) {
      throw new Error('Username or email already in use.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userRes = await db.query(`
      INSERT INTO users (username, email, password, role, status)
      VALUES (?, ?, ?, 'teacher', 'active')
    `, [username, email, hashedPassword]);

    let userId = userRes.insertId;
    if (!userId) {
      const u = await db.query('SELECT id FROM users WHERE username = ?', [username]);
      userId = u.rows[0].id;
    }

    const teacherRes = await db.query(`
      INSERT INTO teachers (
        user_id, full_name, phone, email, qualification,
        specialization, salary, joining_date, status, avatar_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
    `, [
      userId, full_name, phone || '', email || '', qualification || '',
      specialization || '', salary || 0, joining_date || new Date().toISOString().split('T')[0],
      avatar_url || ''
    ]);

    return { success: true, message: 'Teacher created successfully.', teacherId: teacherRes.insertId };
  }

  static async update(id, data) {
    const { full_name, phone, email, qualification, specialization, salary, status, avatar_url } = data;
    await db.query(`
      UPDATE teachers SET
        full_name = ?, phone = ?, email = ?, qualification = ?,
        specialization = ?, salary = ?, status = ?, avatar_url = ?
      WHERE id = ?
    `, [full_name, phone, email, qualification, specialization, salary || 0, status || 'active', avatar_url || '', id]);

    return { success: true, message: 'Teacher updated successfully.' };
  }

  static async delete(id) {
    const t = await db.query('SELECT user_id FROM teachers WHERE id = ?', [id]);
    if (t.rows && t.rows.length > 0) {
      await db.query('DELETE FROM users WHERE id = ?', [t.rows[0].user_id]);
    }
    return { success: true, message: 'Teacher deleted successfully.' };
  }

  static async assignClassesAndSubjects(teacherId, assignments) {
    // assignments is array of { class_id, subject_id }
    await db.query('DELETE FROM teacher_classes WHERE teacher_id = ?', [teacherId]);

    if (Array.isArray(assignments)) {
      for (const item of assignments) {
        if (item.class_id && item.subject_id) {
          await db.query(`
            INSERT INTO teacher_classes (teacher_id, class_id, subject_id)
            VALUES (?, ?, ?)
          `, [teacherId, item.class_id, item.subject_id]);
        }
      }
    }
    return { success: true, message: 'Assignments updated successfully.' };
  }

  static async getTeacherDashboard(teacherId) {
    // Get assigned classes and subjects
    const assignmentsRes = await db.query(`
      SELECT DISTINCT c.id as class_id, c.name as class_name, c.section
      FROM teacher_classes tc
      JOIN classes c ON tc.class_id = c.id
      WHERE tc.teacher_id = ?
    `, [teacherId]);

    const assignedClassIds = assignmentsRes.rows.map(r => r.class_id);

    let totalStudents = 0;
    if (assignedClassIds.length > 0) {
      const placeholders = assignedClassIds.map(() => '?').join(',');
      const studentsRes = await db.query(`
        SELECT COUNT(*) as count FROM students WHERE class_id IN (${placeholders}) AND status = 'active'
      `, assignedClassIds);
      totalStudents = Number(studentsRes.rows[0]?.count || 0);
    }

    const homeworkRes = await db.query(`
      SELECT h.*, c.name as class_name, s.name as subject_name
      FROM homework h
      JOIN classes c ON h.class_id = c.id
      JOIN subjects s ON h.subject_id = s.id
      WHERE h.teacher_id = ?
      ORDER BY h.id DESC LIMIT 5
    `, [teacherId]);

    return {
      classes: assignmentsRes.rows || [],
      totalStudents,
      recentHomework: homeworkRes.rows || []
    };
  }
}
