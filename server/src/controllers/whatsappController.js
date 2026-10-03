import { SettingsService } from '../services/SettingsService.js';
import { StudentService } from '../services/StudentService.js';
import { FeeService } from '../services/FeeService.js';
import { ResultService } from '../services/ResultService.js';
import { AttendanceService } from '../services/AttendanceService.js';
import {
  formatFeeReceiptWhatsApp,
  formatResultWhatsApp,
  formatAttendanceWhatsApp,
  formatHomeworkWhatsApp
} from '../utils/whatsappFormatter.js';

export const generateFeeReceiptMessage = async (req, res, next) => {
  try {
    const { feeId } = req.params;
    const settings = await SettingsService.getSettings();
    const feeData = await FeeService.getFeeById(feeId);
    const studentData = await StudentService.getById(feeData.fee.student_id);

    const latestPayment = feeData.payments && feeData.payments.length > 0 ? feeData.payments[0] : null;

    const message = formatFeeReceiptWhatsApp({
      academy: settings,
      student: studentData.student,
      fee: feeData.fee,
      payment: latestPayment
    });

    const targetPhone = (studentData.student.guardian_phone || studentData.student.phone || '').replace(/[^0-9]/g, '');
    const waUrl = targetPhone 
      ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    res.json({
      success: true,
      messageText: message,
      targetPhone,
      shareUrl: waUrl
    });
  } catch (err) {
    next(err);
  }
};

export const generateResultMessage = async (req, res, next) => {
  try {
    const { examId, studentId } = req.params;
    const settings = await SettingsService.getSettings();
    const studentData = await StudentService.getById(studentId);
    const marksheet = await ResultService.getExamMarksheet(examId);

    const studentResults = (marksheet.results || []).filter(r => r.student_id === parseInt(studentId, 10));

    let total = 0;
    let obtained = 0;
    for (const r of studentResults) {
      total += Number(r.total_marks);
      obtained += Number(r.obtained_marks);
    }
    const pct = total > 0 ? ((obtained / total) * 100).toFixed(1) : 0;

    const message = formatResultWhatsApp({
      academy: settings,
      student: studentData.student,
      exam: marksheet.exam,
      results: studentResults,
      summary: {
        totalMarks: total,
        obtainedMarks: obtained,
        percentage: pct,
        grade: pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : 'D',
        remarks: pct >= 80 ? 'Outstanding performance! Keep it up.' : 'Good effort, continuous revision recommended.'
      }
    });

    const targetPhone = (studentData.student.guardian_phone || studentData.student.phone || '').replace(/[^0-9]/g, '');
    const waUrl = targetPhone 
      ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    res.json({
      success: true,
      messageText: message,
      targetPhone,
      shareUrl: waUrl
    });
  } catch (err) {
    next(err);
  }
};

export const generateAttendanceMessage = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { month } = req.query;
    const settings = await SettingsService.getSettings();
    const studentData = await StudentService.getById(studentId);
    const attData = await AttendanceService.getStudentAttendance(studentId, month);

    const message = formatAttendanceWhatsApp({
      academy: settings,
      student: studentData.student,
      stats: attData.stats,
      month
    });

    const targetPhone = (studentData.student.guardian_phone || studentData.student.phone || '').replace(/[^0-9]/g, '');
    const waUrl = targetPhone 
      ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    res.json({
      success: true,
      messageText: message,
      targetPhone,
      shareUrl: waUrl
    });
  } catch (err) {
    next(err);
  }
};
