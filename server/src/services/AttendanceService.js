import db from '../database/index.js';

export class AttendanceService {
  /**
   * Get attendance sheet for a class on a specific date
   */
  static async getClassDailySheet(classId, date) {
    const queryDate = date || new Date().toISOString().split('T')[0];

    const res = await db.query(`
      SELECT 
        s.id as student_id,
        s.roll_number,
        s.full_name,
        s.phone,
        COALESCE(a.status, 'present') as status,
        a.remarks,
        a.id as attendance_id
      FROM students s
      LEFT JOIN attendance a ON s.id = a.student_id AND a.date = ?
      WHERE s.class_id = ? AND s.status = 'active'
      ORDER BY s.roll_number ASC
    `, [queryDate, classId]);

    return {
      date: queryDate,
      classId,
      students: res.rows || []
    };
  }

  /**
   * Save or update daily attendance batch
   */
  static async markBatchAttendance(classId, date, records, markedByUserId) {
    const attendanceDate = date || new Date().toISOString().split('T')[0];

    for (const record of records) {
      const { student_id, status, remarks } = record;
      if (!student_id || !status) continue;

      // Upsert attendance for (student_id, date)
      const existing = await db.query(
        'SELECT id FROM attendance WHERE student_id = ? AND date = ?',
        [student_id, attendanceDate]
      );

      if (existing.rows && existing.rows.length > 0) {
        await db.query(`
          UPDATE attendance
          SET status = ?, remarks = ?, marked_by = ?
          WHERE id = ?
        `, [status, remarks || '', markedByUserId, existing.rows[0].id]);
      } else {
        await db.query(`
          INSERT INTO attendance (student_id, class_id, date, status, remarks, marked_by)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [student_id, classId, attendanceDate, status, remarks || '', markedByUserId]);
      }
    }

    return { success: true, message: 'Attendance marked successfully.' };
  }

  /**
   * Get student's monthly or overall attendance history and statistics
   */
  static async getStudentAttendance(studentId, yearMonth = '') {
    let sql = `
      SELECT a.*, c.name as class_name
      FROM attendance a
      JOIN classes c ON a.class_id = c.id
      WHERE a.student_id = ?
    `;
    const params = [studentId];

    if (yearMonth) {
      sql += ` AND a.date LIKE ?`;
      params.push(`${yearMonth}%`);
    }

    sql += ` ORDER BY a.date DESC`;

    const recordsRes = await db.query(sql, params);
    const records = recordsRes.rows || [];

    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const leave = records.filter(r => r.status === 'leave').length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 100;

    return {
      stats: {
        total,
        present,
        absent,
        leave,
        percentage: Number(percentage)
      },
      records
    };
  }

  /**
   * Get class monthly attendance summary report
   */
  static async getClassMonthlyReport(classId, yearMonth) {
    const ym = yearMonth || new Date().toISOString().slice(0, 7); // 'YYYY-MM'

    const res = await db.query(`
      SELECT 
        s.id as student_id,
        s.roll_number,
        s.full_name,
        COUNT(a.id) as total_days,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
        SUM(CASE WHEN a.status = 'leave' THEN 1 ELSE 0 END) as leave_count
      FROM students s
      LEFT JOIN attendance a ON s.id = a.student_id AND a.date LIKE ?
      WHERE s.class_id = ? AND s.status = 'active'
      GROUP BY s.id, s.roll_number, s.full_name
      ORDER BY s.roll_number ASC
    `, [`${ym}%`, classId]);

    const formatted = (res.rows || []).map(r => {
      const tot = Number(r.total_days || 0);
      const pres = Number(r.present_count || 0);
      return {
        ...r,
        percentage: tot > 0 ? ((pres / tot) * 100).toFixed(1) : '100.0'
      };
    });

    return {
      month: ym,
      classId,
      students: formatted
    };
  }
}
