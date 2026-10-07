import db from '../database/index.js';

export class DashboardService {
  static async getAdminStats() {
    const today = new Date().toISOString().split('T')[0];
    const isSupabase = db.getProvider() === 'supabase';

    // 1. Total and Active Students
    let studentStats = {};
    try {
      const studentStatsRes = await db.query(`
        SELECT 
          COUNT(*) as total_students,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_students
        FROM students
      `);
      studentStats = studentStatsRes.rows[0] || {};
    } catch (e) {
      console.error('Error fetching student stats:', e.message);
    }

    // 2. Total Teachers
    let totalTeachers = 0;
    try {
      const teacherStatsRes = await db.query(`
        SELECT COUNT(*) as total_teachers FROM teachers WHERE status = 'active'
      `);
      totalTeachers = Number(teacherStatsRes.rows[0]?.total_teachers || 0);
    } catch (e) {
      console.error('Error fetching teacher stats:', e.message);
    }

    // 3. Attendance (Today or Latest Available)
    let markedToday = 0;
    let presentToday = 0;
    let todayAttendancePct = 0;

    try {
      const todayAttRes = await db.query(`
        SELECT 
          COUNT(*) as marked_today,
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_today
        FROM attendance
        WHERE date = ?
      `, [today]);

      markedToday = Number(todayAttRes.rows[0]?.marked_today || 0);
      presentToday = Number(todayAttRes.rows[0]?.present_today || 0);

      // If no attendance marked yet today, fallback to latest marked date
      if (markedToday === 0) {
        const latestAttRes = await db.query(`
          SELECT 
            COUNT(*) as marked_latest,
            SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_latest
          FROM attendance
          WHERE date = (SELECT MAX(date) FROM attendance)
        `);
        if (latestAttRes.rows && latestAttRes.rows.length > 0 && Number(latestAttRes.rows[0]?.marked_latest || 0) > 0) {
          markedToday = Number(latestAttRes.rows[0].marked_latest);
          presentToday = Number(latestAttRes.rows[0].present_latest || 0);
        }
      }

      todayAttendancePct = markedToday > 0 ? Number(((presentToday / markedToday) * 100).toFixed(1)) : 0;
    } catch (e) {
      console.error('Error fetching attendance stats:', e.message);
    }

    // 4. Fees Collected and Outstanding
    let totalCollected = 0;
    let totalOutstanding = 0;
    try {
      const feesStatsRes = await db.query(`
        SELECT 
          SUM(paid_amount) as total_collected,
          SUM(total_amount - paid_amount) as total_outstanding
        FROM fees
      `);
      totalCollected = Number(feesStatsRes.rows[0]?.total_collected || 0);
      totalOutstanding = Math.max(0, Number(feesStatsRes.rows[0]?.total_outstanding || 0));
    } catch (e) {
      console.error('Error fetching fees stats:', e.message);
    }

    // 5. Pending Homework
    let activeHomework = 0;
    try {
      const hwRes = await db.query(`
        SELECT COUNT(*) as count FROM homework WHERE due_date >= ?
      `, [today]);
      activeHomework = Number(hwRes.rows[0]?.count || 0);
      if (activeHomework === 0) {
        const totalHw = await db.query('SELECT COUNT(*) as count FROM homework');
        activeHomework = Number(totalHw.rows[0]?.count || 0);
      }
    } catch (e) {
      console.error('Error fetching homework count:', e.message);
    }

    // 6. Recent Payments
    let recentPayments = [];
    try {
      const recentPaymentsRes = await db.query(`
        SELECT p.*, s.full_name as student_name, s.roll_number, f.month_year
        FROM payments p
        JOIN students s ON p.student_id = s.id
        JOIN fees f ON p.fee_id = f.id
        ORDER BY p.id DESC
        LIMIT 5
      `);
      recentPayments = recentPaymentsRes.rows || [];
    } catch (e) {
      console.error('Error fetching recent payments:', e.message);
    }

    // 7. Recent Students
    let recentStudents = [];
    try {
      const recentStudentsRes = await db.query(`
        SELECT s.*, c.name as class_name
        FROM students s
        JOIN classes c ON s.class_id = c.id
        ORDER BY s.id DESC
        LIMIT 5
      `);
      recentStudents = recentStudentsRes.rows || [];
    } catch (e) {
      console.error('Error fetching recent students:', e.message);
    }

    // 8. Upcoming or Recent Exams
    let upcomingExams = [];
    try {
      let examsRes = await db.query(`
        SELECT e.*, c.name as class_name, c.section
        FROM exams e
        JOIN classes c ON e.class_id = c.id
        WHERE e.exam_date >= ?
        ORDER BY e.exam_date ASC
        LIMIT 5
      `, [today]);

      if (!examsRes.rows || examsRes.rows.length === 0) {
        examsRes = await db.query(`
          SELECT e.*, c.name as class_name, c.section
          FROM exams e
          JOIN classes c ON e.class_id = c.id
          ORDER BY e.exam_date DESC
          LIMIT 5
        `);
      }
      upcomingExams = examsRes.rows || [];
    } catch (e) {
      console.error('Error fetching upcoming exams:', e.message);
    }

    // 9. Monthly Fee Collection Chart Data (Supports Supabase PostgreSQL & MySQL)
    let monthlyFeeChart = [];
    try {
      let feeChartRes;
      if (isSupabase) {
        feeChartRes = await db.query(`
          SELECT 
            TO_CHAR(payment_date, 'Mon YYYY') as month_label,
            TO_CHAR(payment_date, 'Mon') as short_month,
            EXTRACT(YEAR FROM payment_date)::integer as year_val,
            SUM(amount) as collected,
            COUNT(id) as payment_count
          FROM payments
          GROUP BY TO_CHAR(payment_date, 'Mon YYYY'), TO_CHAR(payment_date, 'Mon'), EXTRACT(YEAR FROM payment_date), DATE_TRUNC('month', payment_date)
          ORDER BY DATE_TRUNC('month', payment_date) ASC
          LIMIT 12
        `);
      } else {
        feeChartRes = await db.query(`
          SELECT 
            DATE_FORMAT(payment_date, '%b %Y') as month_label,
            DATE_FORMAT(payment_date, '%b') as short_month,
            YEAR(payment_date) as year_val,
            SUM(amount) as collected,
            COUNT(id) as payment_count
          FROM payments
          GROUP BY DATE_FORMAT(payment_date, '%b %Y'), DATE_FORMAT(payment_date, '%b'), YEAR(payment_date), MONTH(payment_date)
          ORDER BY YEAR(payment_date) ASC, MONTH(payment_date) ASC
          LIMIT 12
        `);
      }
      monthlyFeeChart = feeChartRes.rows || [];
    } catch (e) {
      console.error('Error fetching fee chart data:', e.message);
    }

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
      recentPayments,
      recentStudents,
      upcomingExams,
      monthlyFeeChart
    };
  }
}

