import db from '../database/index.js';

export class ReportService {
  /**
   * Comprehensive Student 360 Report
   */
  static async getStudentReport(studentId) {
    const studentRes = await db.query(`
      SELECT s.*, c.name as class_name, c.section, u.email as account_email
      FROM students s
      JOIN classes c ON s.class_id = c.id
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `, [studentId]);

    if (!studentRes.rows || studentRes.rows.length === 0) throw new Error('Student not found');
    const student = studentRes.rows[0];

    const attRes = await db.query(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'leave' THEN 1 ELSE 0 END) as leave_days
      FROM attendance WHERE student_id = ?
    `, [studentId]);
    const att = attRes.rows[0] || {};
    const totalDays = Number(att.total_days || 0);
    const presentDays = Number(att.present_days || 0);

    const feeRes = await db.query(`
      SELECT * FROM fees WHERE student_id = ? ORDER BY id DESC
    `, [studentId]);

    const resultRes = await db.query(`
      SELECT r.*, e.title as exam_title, e.exam_date, sub.name as subject_name
      FROM results r
      JOIN exams e ON r.exam_id = e.id
      JOIN subjects sub ON r.subject_id = sub.id
      WHERE r.student_id = ?
      ORDER BY e.exam_date DESC
    `, [studentId]);

    return {
      student,
      attendance: {
        total: totalDays,
        present: presentDays,
        absent: Number(att.absent_days || 0),
        leave: Number(att.leave_days || 0),
        percentage: totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 100
      },
      fees: feeRes.rows || [],
      results: resultRes.rows || []
    };
  }

  /**
   * Comprehensive Fee Collection Report
   */
  static async getFeeReport({ classId = '', month = '', status = '' }) {
    let sql = `
      SELECT f.*, s.roll_number, s.full_name as student_name, s.phone, c.name as class_name, c.section
      FROM fees f
      JOIN students s ON f.student_id = s.id
      JOIN classes c ON s.class_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (classId) {
      sql += ` AND s.class_id = ?`;
      params.push(classId);
    }
    if (month) {
      sql += ` AND f.month_year LIKE ?`;
      params.push(`%${month}%`);
    }
    if (status) {
      sql += ` AND f.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY f.id DESC`;

    const res = await db.query(sql, params);
    const fees = res.rows || [];

    let totalBilled = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;
    let countPaid = 0;
    let countPartial = 0;
    let countUnpaid = 0;

    for (const f of fees) {
      const tot = Number(f.total_amount);
      const paid = Number(f.paid_amount);
      totalBilled += tot;
      totalCollected += paid;
      totalOutstanding += Math.max(0, tot - paid);

      if (f.status === 'paid') countPaid++;
      else if (f.status === 'partial') countPartial++;
      else countUnpaid++;
    }

    return {
      summary: {
        totalVouchers: fees.length,
        totalBilled,
        totalCollected,
        totalOutstanding,
        countPaid,
        countPartial,
        countUnpaid
      },
      records: fees
    };
  }

  /**
   * Result Analysis Report for an Exam
   */
  static async getResultReport(examId) {
    const examRes = await db.query(`
      SELECT e.*, c.name as class_name, c.section
      FROM exams e JOIN classes c ON e.class_id = c.id
      WHERE e.id = ?
    `, [examId]);

    if (!examRes.rows || examRes.rows.length === 0) throw new Error('Exam not found');
    const exam = examRes.rows[0];

    const resultsRes = await db.query(`
      SELECT r.*, s.roll_number, s.full_name as student_name, sub.name as subject_name
      FROM results r
      JOIN students s ON r.student_id = s.id
      JOIN subjects sub ON r.subject_id = sub.id
      WHERE r.exam_id = ?
      ORDER BY s.roll_number ASC, sub.name ASC
    `, [examId]);

    return {
      exam,
      records: resultsRes.rows || []
    };
  }
}
