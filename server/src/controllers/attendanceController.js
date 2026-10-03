import { AttendanceService } from '../services/AttendanceService.js';

export const getClassDailySheet = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;
    const data = await AttendanceService.getClassDailySheet(classId, date);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

export const markBatchAttendance = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { date, records } = req.body;
    const result = await AttendanceService.markBatchAttendance(classId, date, records, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getStudentAttendance = async (req, res, next) => {
  try {
    const studentId = req.params.studentId || req.user.studentId;
    const { month } = req.query;
    const data = await AttendanceService.getStudentAttendance(studentId, month);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

export const getClassMonthlyReport = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { month } = req.query;
    const data = await AttendanceService.getClassMonthlyReport(classId, month);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};
