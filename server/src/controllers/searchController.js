import db from '../database/index.js';

export const globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, results: { students: [], teachers: [], classes: [], fees: [] } });
    }

    const term = `%${q.trim()}%`;

    // Search students
    const studentsRes = await db.query(`
      SELECT s.id, s.roll_number, s.full_name, s.phone, c.name as class_name
      FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE s.full_name LIKE ? OR s.roll_number LIKE ? OR s.phone LIKE ?
      LIMIT 10
    `, [term, term, term]);

    // Search teachers
    const teachersRes = await db.query(`
      SELECT t.id, t.full_name, t.phone, t.email, t.specialization
      FROM teachers t
      WHERE t.full_name LIKE ? OR t.phone LIKE ? OR t.specialization LIKE ?
      LIMIT 10
    `, [term, term, term]);

    // Search classes
    const classesRes = await db.query(`
      SELECT id, name, section, monthly_tuition_fee
      FROM classes
      WHERE name LIKE ? OR section LIKE ?
      LIMIT 5
    `, [term, term]);

    // Search fees / invoices
    const feesRes = await db.query(`
      SELECT f.id, f.month_year, f.total_amount, f.paid_amount, f.status, s.full_name as student_name
      FROM fees f
      JOIN students s ON f.student_id = s.id
      WHERE f.status LIKE ? OR f.month_year LIKE ? OR s.full_name LIKE ?
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
