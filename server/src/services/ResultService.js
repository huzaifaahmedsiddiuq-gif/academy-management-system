import db from '../database/index.js';

export const calculateGrade = (percentage) => {
  const p = Number(percentage);
  if (p >= 90) return 'A+';
  if (p >= 80) return 'A';
  if (p >= 70) return 'B';
  if (p >= 60) return 'C';
  if (p >= 50) return 'D';
  return 'F';
};

export class ResultService {
  static async getExams(classId = '') {
    let sql = `
      SELECT e.*, c.name as class_name, c.section,
        (SELECT COUNT(DISTINCT student_id) FROM results WHERE exam_id = e.id) as students_graded
      FROM exams e
      JOIN classes c ON e.class_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (classId) {
      sql += ` AND e.class_id = ?`;
      params.push(classId);
    }

    sql += ` ORDER BY e.exam_date DESC, e.id DESC`;

    const res = await db.query(sql, params);
    return res.rows || [];
  }

  static async createExam(data) {
    const { title, class_id, exam_date, is_published } = data;
    if (!title || !class_id) throw new Error('Exam title and class are required.');

    const res = await db.query(`
      INSERT INTO exams (title, class_id, exam_date, is_published)
      VALUES (?, ?, ?, ?)
    `, [title, class_id, exam_date || new Date().toISOString().split('T')[0], is_published ? true : false]);

    return { success: true, message: 'Exam created successfully.', examId: res.insertId };
  }

  static async updateExam(id, data) {
    const { title, class_id, exam_date, is_published } = data;
    await db.query(`
      UPDATE exams SET title = ?, class_id = ?, exam_date = ?, is_published = ?
      WHERE id = ?
    `, [title, class_id, exam_date, is_published ? true : false, id]);

    return { success: true, message: 'Exam updated successfully.' };
  }

  static async togglePublish(id) {
    const e = await db.query('SELECT is_published FROM exams WHERE id = ?', [id]);
    if (!e.rows || e.rows.length === 0) throw new Error('Exam not found');
    const newState = !e.rows[0].is_published;
    await db.query('UPDATE exams SET is_published = ? WHERE id = ?', [newState, id]);
    return { success: true, is_published: newState };
  }

  static async deleteExam(id) {
    await db.query('DELETE FROM exams WHERE id = ?', [id]);
    return { success: true, message: 'Exam deleted successfully.' };
  }

  static async getExamMarksheet(examId, subjectId = '') {
    const examRes = await db.query(`
      SELECT e.*, c.name as class_name, c.section
      FROM exams e JOIN classes c ON e.class_id = c.id
      WHERE e.id = ?
    `, [examId]);

    if (!examRes.rows || examRes.rows.length === 0) throw new Error('Exam not found');
    const exam = examRes.rows[0];

    // Get all students in this class
    const studentsRes = await db.query(`
      SELECT s.id as student_id, s.roll_number, s.full_name
      FROM students s
      WHERE s.class_id = ? AND s.status = 'active'
      ORDER BY s.roll_number ASC
    `, [exam.class_id]);

    let resultsSql = `
      SELECT r.*, sub.name as subject_name, sub.code as subject_code
      FROM results r
      JOIN subjects sub ON r.subject_id = sub.id
      WHERE r.exam_id = ?
    `;
    const params = [examId];
    if (subjectId) {
      resultsSql += ` AND r.subject_id = ?`;
      params.push(subjectId);
    }

    const resultsRes = await db.query(resultsSql, params);

    return {
      exam,
      students: studentsRes.rows || [],
      results: resultsRes.rows || []
    };
  }

  static async saveMarksBatch(examId, marksRecords) {
    // marksRecords: array of { student_id, subject_id, total_marks, obtained_marks, remarks }
    for (const record of marksRecords) {
      const { student_id, subject_id, total_marks = 100, obtained_marks, remarks = '' } = record;
      if (obtained_marks === undefined || obtained_marks === null || obtained_marks === '') continue;

      const total = Number(total_marks) || 100;
      const obtained = Number(obtained_marks);
      const percentage = (obtained / total) * 100;
      const grade = calculateGrade(percentage);

      const existing = await db.query(`
        SELECT id FROM results WHERE exam_id = ? AND student_id = ? AND subject_id = ?
      `, [examId, student_id, subject_id]);

      if (existing.rows && existing.rows.length > 0) {
        await db.query(`
          UPDATE results
          SET total_marks = ?, obtained_marks = ?, grade = ?, remarks = ?
          WHERE id = ?
        `, [total, obtained, grade, remarks, existing.rows[0].id]);
      } else {
        await db.query(`
          INSERT INTO results (exam_id, student_id, subject_id, total_marks, obtained_marks, grade, remarks)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [examId, student_id, subject_id, total, obtained, grade, remarks]);
      }
    }
    return { success: true, message: 'Marks updated successfully.' };
  }

  static async getStudentResults(studentId) {
    const res = await db.query(`
      SELECT 
        r.*, 
        e.title as exam_title, 
        e.exam_date,
        s.name as subject_name,
        s.code as subject_code
      FROM results r
      JOIN exams e ON r.exam_id = e.id
      JOIN subjects s ON r.subject_id = s.id
      WHERE r.student_id = ? AND e.is_published = TRUE
      ORDER BY e.exam_date DESC, r.id ASC
    `, [studentId]);

    // Group by Exam
    const examMap = {};
    for (const row of res.rows || []) {
      if (!examMap[row.exam_id]) {
        examMap[row.exam_id] = {
          exam_id: row.exam_id,
          exam_title: row.exam_title,
          exam_date: row.exam_date,
          subjects: [],
          totalMarks: 0,
          obtainedMarks: 0
        };
      }
      examMap[row.exam_id].subjects.push(row);
      examMap[row.exam_id].totalMarks += Number(row.total_marks);
      examMap[row.exam_id].obtainedMarks += Number(row.obtained_marks);
    }

    const examCards = Object.values(examMap).map(e => {
      const pct = e.totalMarks > 0 ? ((e.obtainedMarks / e.totalMarks) * 100).toFixed(1) : 0;
      return {
        ...e,
        percentage: Number(pct),
        overallGrade: calculateGrade(pct)
      };
    });

    return examCards;
  }
}
