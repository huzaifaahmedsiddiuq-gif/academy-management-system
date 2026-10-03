import db from '../database/index.js';

export class DashboardService {
  static async getAdminStats() {
    const today = new Date().toISOString().split('T')[0];

    // Total and Active Students
    const studentStatsRes = await db.query(`
      SELECT 
        COUNT(*) as total_students,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_students
      FROM students
    `);
    const studentStats = studentStatsRes.rows[0] || {};

    // Total Teachers
    const teacherStatsRes = await db.query(`
      SELECT COUNT(*) as total_teachers FROM teachers WHERE status = 'active'
    `);
    const totalTeachers = Number(teacherStatsRes.rows[0]?.total_teachers || 0);

    // Today's Attendance
    const todayAttRes = await db.query(`
      SELECT 
        COUNT(*) as marked_today,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_today
      FROM attendance
      WHERE date = ?
    `, [today]);
    const markedToday = Number(todayAttRes.rows[0]?.marked_today || 0);
    const presentToday = Number(todayAttRes.rows[0]?.present_today || 0);
    const todayAttendancePct = markedToday > 0 ? ((presentToday / markedToday) * 100).toFixed(1) : 0;

    // Fees Collected and Outstanding
    const feesStatsRes = await db.query(`
      SELECT 
        SUM(paid_amount) as total_collected,
        SUM(total_amount - paid_amount) as total_outstanding
      FROM fees
    `);
    const totalCollected = Number(feesStatsRes.rows[0]?.total_collected || 0);
    const totalOutstanding = Math.max(0, Number(feesStatsRes.rows[0]?.total_outstanding || 0));

    // Pending Homework
    const hwRes = await db.query(`
      SELECT COUNT(*) as count FROM homework WHERE due_date >= ?
    `, [today]);
    const activeHomework = Number(hwRes.rows[0]?.count || 0);

    // Recent Payments
    const recentPaymentsRes = await db.query(`
      SELECT p.*, s.full_name as student_name, s.roll_number, f.month_year
      FROM payments p
      JOIN students s ON p.student_id = s.id
      JOIN fees f ON p.fee_id = f.id
      ORDER BY p.id DESC
      LIMIT 5
    `);

    // Recent Students
    const recentStudentsRes = await db.query(`
      SELECT s.*, c.name as class_name
      FROM students s
      JOIN classes c ON s.class_id = c.id
      ORDER BY s.id DESC
      LIMIT 5
    `);

    // Upcoming Exams
    const upcomingExamsRes = await db.query(`
      SELECT e.*, c.name as class_name, c.section
      FROM exams e
      JOIN classes c ON e.class_id = c.id
      WHERE e.exam_date >= ?
      ORDER BY e.exam_date ASC
      LIMIT 5
    `, [today]);

    // Monthly Fee Collection Chart Data (Aggregated from payments or fees)
    const feeChartRes = await db.query(`
      SELECT 
        DATE_FORMAT(payment_date, '%b %Y') as month_label,
        SUM(amount) as collected
      FROM payments
      GROUP BY DATE_FORMAT(payment_date, '%b %Y'), YEAR(payment_date), MONTH(payment_date)
      ORDER BY YEAR(payment_date) ASC, MONTH(payment_date) ASC
      LIMIT 6
    `);

    return {
      cards: {
        totalStudents: Number(studentStats.total_students || 0),
        activeStudents: Number(studentStats.active_students || 0),
        totalTeachers,
        todayAttendancePct: Number(todayAttendancePct),
        todayPresent: presentToday,
        totalCollected,
        totalOutstanding,
        activeHomework
      },
      recentPayments: recentPaymentsRes.rows || [],
      recentStudents: recentStudentsRes.rows || [],
      upcomingExams: upcomingExamsRes.rows || [],
      monthlyFeeChart: feeChartRes.rows || []
    };
  }
}
