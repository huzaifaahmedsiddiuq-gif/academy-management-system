import db from '../database/index.js';

export const globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, results: { students: [], teachers: [], classes: [], fees: [] } });
    }

    const term = `%${q.trim()}%`;

    // Search students — LEFT JOIN so students without a class_id are still found
    const studentsRes = await db.query(`
      SELECT s.id, s.roll_number, s.full_name, s.phone, c.name as class_name
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.full_name ILIKE ? OR s.roll_number ILIKE ? OR s.phone ILIKE ? OR c.name ILIKE ?
      LIMIT 10
    `, [term, term, term, term]);

    // Search teachers — ILIKE for case-insensitive matching
    const teachersRes = await db.query(`
      SELECT t.id, t.full_name, t.phone, t.email, t.specialization
      FROM teachers t
      WHERE t.full_name ILIKE ? OR t.phone ILIKE ? OR t.specialization ILIKE ?
      LIMIT 10
    `, [term, term, term]);

    // Search classes — ILIKE for case-insensitive matching
    const classesRes = await db.query(`
      SELECT id, name, section, monthly_tuition_fee
      FROM classes
      WHERE name ILIKE ? OR section ILIKE ?
      LIMIT 5
    `, [term, term]);

    // Search fees / invoices — ILIKE for case-insensitive matching on status and student name
    const feesRes = await db.query(`
      SELECT f.id, f.month_year, f.total_amount, f.paid_amount, f.status, s.full_name as student_name
      FROM fees f
      LEFT JOIN students s ON f.student_id = s.id
      WHERE f.status ILIKE ? OR f.month_year ILIKE ? OR s.full_name ILIKE ?
      LIMIT 10
    `, [term, term, term]);

    res.json({
      success: true,
      query: q,
      results: {
        students: studentsRes.rows || [],
        teachers: teachersRes.rows || [],
        classes: classesRes.rows || [],
        fees: feesRes.rows || []
      }
    });
  } catch (err) {
    next(err);
  }
};
