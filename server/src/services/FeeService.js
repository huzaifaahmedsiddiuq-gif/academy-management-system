import db from '../database/index.js';

export class FeeService {
  static async getAllFees({ month = '', status = '', classId = '', search = '' }) {
    let sql = `
      SELECT f.*, s.roll_number, s.full_name as student_name, s.phone, c.name as class_name, c.section
      FROM fees f
      JOIN students s ON f.student_id = s.id
      JOIN classes c ON s.class_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (month) {
      sql += ` AND f.month_year LIKE ?`;
      params.push(`%${month}%`);
    }

    if (status) {
      sql += ` AND f.status = ?`;
      params.push(status);
    }

    if (classId) {
      sql += ` AND s.class_id = ?`;
      params.push(classId);
    }

    if (search) {
      sql += ` AND (s.full_name LIKE ? OR s.roll_number LIKE ? OR s.phone LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    sql += ` ORDER BY f.id DESC`;

    const res = await db.query(sql, params);
    return res.rows || [];
  }

  static async getFeeById(id) {
    const feeRes = await db.query(`
      SELECT f.*, s.roll_number, s.full_name as student_name, s.phone, s.guardian_phone,
             c.name as class_name, c.section
      FROM fees f
      JOIN students s ON f.student_id = s.id
      JOIN classes c ON s.class_id = c.id
      WHERE f.id = ?
    `, [id]);

    if (!feeRes.rows || feeRes.rows.length === 0) throw new Error('Fee record not found');
    const fee = feeRes.rows[0];

    const paymentsRes = await db.query(`
      SELECT p.*, u.username as received_by_name
      FROM payments p
      LEFT JOIN users u ON p.received_by = u.id
      WHERE p.fee_id = ?
      ORDER BY p.payment_date DESC, p.id DESC
    `, [id]);

    return {
      fee,
      payments: paymentsRes.rows || []
    };
  }

  /**
   * Bulk generate monthly fees for an entire class or all active students
   */
  static async generateMonthlyFees(classId, monthYear, dueDate, feeType = 'Monthly Tuition Fee') {
    let studentSql = `SELECT s.id, c.monthly_tuition_fee FROM students s JOIN classes c ON s.class_id = c.id WHERE s.status = 'active'`;
    const params = [];
    if (classId) {
      studentSql += ` AND s.class_id = ?`;
      params.push(classId);
    }

    const students = await db.query(studentSql, params);
    let createdCount = 0;

    for (const s of students.rows || []) {
      const existing = await db.query(
        'SELECT id FROM fees WHERE student_id = ? AND month_year = ? AND fee_type = ?',
        [s.id, monthYear, feeType]
      );

      if (!existing.rows || existing.rows.length === 0) {
        await db.query(`
          INSERT INTO fees (student_id, month_year, fee_type, total_amount, paid_amount, due_date, status)
          VALUES (?, ?, ?, ?, 0.00, ?, 'unpaid')
        `, [s.id, monthYear, feeType, s.monthly_tuition_fee, dueDate]);
        createdCount++;
      }
    }

    return { success: true, message: `Generated ${createdCount} monthly fee vouchers.`, count: createdCount };
  }

  /**
   * Record a payment against a fee voucher
   */
  static async recordPayment(feeId, data, receivedByUserId) {
    const { amount, payment_method = 'cash', payment_date, remarks = '' } = data;
    const payAmount = Number(amount);
    if (!payAmount || payAmount <= 0) throw new Error('Valid payment amount is required.');

    const feeRes = await db.query('SELECT * FROM fees WHERE id = ?', [feeId]);
    if (!feeRes.rows || feeRes.rows.length === 0) throw new Error('Fee record not found.');
    const fee = feeRes.rows[0];

    const currentPaid = Number(fee.paid_amount || 0);
    const total = Number(fee.total_amount);
    const newPaid = currentPaid + payAmount;
    const remaining = total - newPaid;

    if (newPaid > total) {
      throw new Error(`Payment exceeds remaining balance. Remaining due is ${total - currentPaid}`);
    }

    let newStatus = 'unpaid';
    if (remaining <= 0) {
      newStatus = 'paid';
    } else if (newPaid > 0) {
      newStatus = 'partial';
    }

    // Generate unique receipt number: REC-YYYYMMDD-XXXX
    const dateStr = (payment_date || new Date().toISOString().split('T')[0]).replace(/-/g, '');
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const receiptNumber = `REC-${dateStr}-${randCode}`;

    // Insert payment record
    const paymentRes = await db.query(`
      INSERT INTO payments (fee_id, student_id, amount, payment_method, payment_date, receipt_number, remarks, received_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      feeId, fee.student_id, payAmount, payment_method,
      payment_date || new Date().toISOString().split('T')[0],
      receiptNumber, remarks, receivedByUserId || null
    ]);

    // Update fee record
    await db.query(`
      UPDATE fees SET paid_amount = ?, status = ? WHERE id = ?
    `, [newPaid, newStatus, feeId]);

    return {
      success: true,
      message: 'Payment recorded successfully.',
      receiptNumber,
      paymentId: paymentRes.insertId,
      paidAmount: newPaid,
      remainingAmount: Math.max(0, remaining),
      status: newStatus
    };
  }

  static async getStudentFeeLedger(studentId) {
    const feesRes = await db.query(`
      SELECT f.*, c.name as class_name
      FROM fees f
      JOIN students s ON f.student_id = s.id
      JOIN classes c ON s.class_id = c.id
      WHERE f.student_id = ?
      ORDER BY f.id DESC
    `, [studentId]);

    const paymentsRes = await db.query(`
      SELECT p.*, f.month_year, f.fee_type
      FROM payments p
      JOIN fees f ON p.fee_id = f.id
      WHERE p.student_id = ?
      ORDER BY p.payment_date DESC
    `, [studentId]);

    let totalBilled = 0;
    let totalPaid = 0;

    for (const f of feesRes.rows || []) {
      totalBilled += Number(f.total_amount);
      totalPaid += Number(f.paid_amount);
    }

    return {
      summary: {
        totalBilled,
        totalPaid,
        totalOutstanding: Math.max(0, totalBilled - totalPaid)
      },
      fees: feesRes.rows || [],
      payments: paymentsRes.rows || []
    };
  }
}
