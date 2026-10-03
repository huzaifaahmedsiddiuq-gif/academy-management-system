import db from '../database/index.js';

export class HomeworkService {
  static async getAll({ classId = '', teacherId = '', studentId = '' }) {
    let sql = `
      SELECT h.*, c.name as class_name, c.section, sub.name as subject_name, t.full_name as teacher_name
      FROM homework h
      JOIN classes c ON h.class_id = c.id
      JOIN subjects sub ON h.subject_id = sub.id
      JOIN teachers t ON h.teacher_id = t.id
      WHERE 1=1
    `;
    const params = [];

    if (classId) {
      sql += ` AND h.class_id = ?`;
      params.push(classId);
    }

    if (teacherId) {
      sql += ` AND h.teacher_id = ?`;
      params.push(teacherId);
    }

    sql += ` ORDER BY h.due_date DESC, h.id DESC`;

    const res = await db.query(sql, params);
    const homeworkList = res.rows || [];

    // If studentId passed, attach student's submission status
    if (studentId && homeworkList.length > 0) {
      const subRes = await db.query(`
        SELECT * FROM homework_submissions WHERE student_id = ?
      `, [studentId]);

      const subMap = {};
      for (const s of subRes.rows || []) {
        subMap[s.homework_id] = s;
      }

      return homeworkList.map(h => {
        const submission = subMap[h.id] || null;
        const isPastDue = new Date(h.due_date) < new Date();
        let status = 'Pending';
        if (submission) {
          status = submission.status === 'graded' ? 'Graded' : 'Submitted';
        } else if (isPastDue) {
          status = 'Overdue';
        }

        return {
          ...h,
          submission,
          studentStatus: status
        };
      });
    }

    return homeworkList;
  }

  static async create(data) {
    const { teacher_id, class_id, subject_id, title, description, file_url, assigned_date, due_date } = data;
    if (!teacher_id || !class_id || !subject_id || !title || !due_date) {
      throw new Error('Required fields: teacher_id, class_id, subject_id, title, due_date');
    }

    const res = await db.query(`
      INSERT INTO homework (teacher_id, class_id, subject_id, title, description, file_url, assigned_date, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      teacher_id, class_id, subject_id, title, description || '',
      file_url || '', assigned_date || new Date().toISOString().split('T')[0], due_date
    ]);

    // Send notifications to all students of this class
    const students = await db.query('SELECT user_id FROM students WHERE class_id = ? AND status = "active"', [class_id]);
    for (const s of students.rows || []) {
      await db.query(`
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (?, ?, ?, 'homework', '/student/homework')
      `, [s.user_id, 'New Homework Assigned', `Homework "${title}" is assigned. Due date: ${due_date}`]);
    }

    return { success: true, message: 'Homework created successfully.', homeworkId: res.insertId };
  }

  static async update(id, data) {
    const { class_id, subject_id, title, description, file_url, due_date } = data;
    await db.query(`
      UPDATE homework SET
        class_id = ?, subject_id = ?, title = ?, description = ?, file_url = ?, due_date = ?
      WHERE id = ?
    `, [class_id, subject_id, title, description, file_url, due_date, id]);

    return { success: true, message: 'Homework updated successfully.' };
  }

  static async delete(id) {
    await db.query('DELETE FROM homework WHERE id = ?', [id]);
    return { success: true, message: 'Homework deleted successfully.' };
  }

  static async submitHomework(homeworkId, studentId, data) {
    const { submission_text, file_url } = data;
    const existing = await db.query(
      'SELECT id FROM homework_submissions WHERE homework_id = ? AND student_id = ?',
      [homeworkId, studentId]
    );

    if (existing.rows && existing.rows.length > 0) {
      await db.query(`
        UPDATE homework_submissions
        SET submission_text = ?, file_url = ?, submitted_at = NOW(), status = 'submitted'
        WHERE id = ?
      `, [submission_text || '', file_url || '', existing.rows[0].id]);
    } else {
      await db.query(`
        INSERT INTO homework_submissions (homework_id, student_id, submission_text, file_url, status)
        VALUES (?, ?, ?, ?, 'submitted')
      `, [homeworkId, studentId, submission_text || '', file_url || '']);
    }

    return { success: true, message: 'Homework submitted successfully!' };
  }

  static async gradeSubmission(submissionId, data) {
    const { grade, teacher_feedback } = data;
    await db.query(`
      UPDATE homework_submissions
      SET grade = ?, teacher_feedback = ?, status = 'graded'
      WHERE id = ?
    `, [grade, teacher_feedback || '', submissionId]);

    return { success: true, message: 'Submission graded successfully.' };
  }

  static async getSubmissions(homeworkId) {
    const res = await db.query(`
      SELECT hs.*, s.roll_number, s.full_name
      FROM homework_submissions hs
      JOIN students s ON hs.student_id = s.id
      WHERE hs.homework_id = ?
      ORDER BY hs.submitted_at DESC
    `, [homeworkId]);
    return res.rows || [];
  }
}
