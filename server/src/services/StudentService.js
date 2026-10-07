import bcrypt from 'bcryptjs';
import db from '../database/index.js';

export class StudentService {
  static async getAll({ search = '', classId = '', status = '', page = 1, limit = 50 }) {
    let sql = `
      SELECT s.*, c.name as class_name, u.username, u.email as user_email
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (s.full_name LIKE ? OR s.roll_number LIKE ? OR s.phone LIKE ? OR s.father_name LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (classId) {
      sql += ` AND s.class_id = ?`;
      params.push(classId);
    }

    if (status) {
      sql += ` AND s.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY s.id DESC`;

    const res = await db.query(sql, params);
    return res.rows || [];
  }

  static async getById(id) {
    const studentRes = await db.query(`
      SELECT s.*, c.name as class_name, c.monthly_tuition_fee, u.username, u.email as user_email
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      WHERE s.id = ?
    `, [id]);

    if (!studentRes.rows || studentRes.rows.length === 0) {
      throw new Error('Student not found.');
    }

    const student = studentRes.rows[0];

    // Fetch Attendance stats, Fees, Results, and Payments in parallel
    const [attRes, feeRes, resultsRes, paymentsRes] = await Promise.all([
      db.query(`
        SELECT 
          COUNT(*) as total_days,
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
          SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
          SUM(CASE WHEN status = 'leave' THEN 1 ELSE 0 END) as leave_days
        FROM attendance
        WHERE student_id = ?
      `, [id]),
      db.query(`SELECT * FROM fees WHERE student_id = ? ORDER BY id DESC`, [id]),
      db.query(`
        SELECT r.*, e.title as exam_title, e.exam_date, sub.name as subject_name
        FROM results r
        JOIN exams e ON r.exam_id = e.id
        JOIN subjects sub ON r.subject_id = sub.id
        WHERE r.student_id = ? AND e.is_published = TRUE
        ORDER BY e.exam_date DESC
      `, [id]),
      db.query(`SELECT * FROM payments WHERE student_id = ? ORDER BY payment_date DESC`, [id])
    ]);

    const attStats = attRes.rows[0] || {};
    const totalDays = Number(attStats.total_days || 0);
    const presentDays = Number(attStats.present_days || 0);
    const attPercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 100;

    return {
      student,
      attendance: {
        total: totalDays,
        present: presentDays,
        absent: Number(attStats.absent_days || 0),
        leave: Number(attStats.leave_days || 0),
        percentage: Number(attPercentage)
      },
      fees: feeRes.rows || [],
      results: resultsRes.rows || [],
      payments: paymentsRes.rows || []
    };
  }

  static async create(data) {
    const {
      username, email, password,
      full_name, father_name, roll_number,
      phone, guardian_phone, address,
      date_of_birth, admission_date, class_id, section, profile_picture
    } = data;

    if (!username || !email || !password || !full_name || !roll_number || !class_id) {
      throw new Error('Required fields: username, email, password, full_name, roll_number, class_id');
    }

    // Check duplicate roll number or username
    const existing = await db.query(
      'SELECT id FROM users WHERE username = ? OR email = ? UNION SELECT id FROM students WHERE roll_number = ?',
      [username, email, roll_number]
    );

    if (existing.rows && existing.rows.length > 0) {
      throw new Error('Username, Email, or Roll Number already registered.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userRes = await db.query(`
      INSERT INTO users (username, email, password, role, status)
      VALUES (?, ?, ?, 'student', 'active')
    `, [username, email, hashedPassword]);

    // Retrieve created user id
    let userId = userRes.insertId;
    if (!userId) {
      const u = await db.query('SELECT id FROM users WHERE username = ?', [username]);
      userId = u.rows[0].id;
    }

    // Create student record
    const studentRes = await db.query(`
      INSERT INTO students (
        user_id, roll_number, full_name, father_name, phone,
        guardian_phone, email, address, date_of_birth, admission_date,
        class_id, section, profile_picture, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, [
      userId, roll_number, full_name, father_name || '', phone || '',
      guardian_phone || '', email || '', address || '', date_of_birth || null,
      admission_date || new Date().toISOString().split('T')[0],
      class_id, section || 'A', profile_picture || ''
    ]);

    return { success: true, message: 'Student created successfully.', studentId: studentRes.insertId };
  }

  static async update(id, data) {
    const {
      full_name, father_name, phone, guardian_phone,
      email, address, date_of_birth, class_id, section, status, profile_picture
    } = data;

    await db.query(`
      UPDATE students SET
        full_name = ?, father_name = ?, phone = ?, guardian_phone = ?,
        email = ?, address = ?, date_of_birth = ?, class_id = ?,
        section = ?, status = ?, profile_picture = ?
      WHERE id = ?
    `, [
      full_name, father_name, phone, guardian_phone,
      email, address, date_of_birth || null, class_id,
      section, status || 'active', profile_picture || '', id
    ]);

    return { success: true, message: 'Student updated successfully.' };
  }

  static async delete(id) {
    const s = await db.query('SELECT user_id FROM students WHERE id = ?', [id]);
    if (s.rows && s.rows.length > 0) {
      const userId = s.rows[0].user_id;
      await db.query('DELETE FROM users WHERE id = ?', [userId]);
    }
    return { success: true, message: 'Student deleted successfully.' };
  }

  static async toggleStatus(id) {
    const s = await db.query('SELECT status, user_id FROM students WHERE id = ?', [id]);
    if (!s.rows || s.rows.length === 0) throw new Error('Student not found');
    const newStatus = s.rows[0].status === 'active' ? 'inactive' : 'active';
    await db.query('UPDATE students SET status = ? WHERE id = ?', [newStatus, id]);
    await db.query('UPDATE users SET status = ? WHERE id = ?', [newStatus, s.rows[0].user_id]);
    return { success: true, status: newStatus };
  }

  static async resetPassword(id, newPassword) {
    const s = await db.query('SELECT user_id FROM students WHERE id = ?', [id]);
    if (!s.rows || s.rows.length === 0) throw new Error('Student not found');
    const hashed = await bcrypt.hash(newPassword || 'student123', 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, s.rows[0].user_id]);
    return { success: true, message: 'Password reset successfully.' };
  }
}
