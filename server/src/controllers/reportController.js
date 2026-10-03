import { ReportService } from '../services/ReportService.js';

export const getStudentReport = async (req, res, next) => {
  try {
    const studentId = req.params.studentId || req.user.studentId;
    const data = await ReportService.getStudentReport(studentId);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

export const getFeeReport = async (req, res, next) => {
  try {
    const { classId, month, status } = req.query;
    const data = await ReportService.getFeeReport({ classId, month, status });
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

export const getResultReport = async (req, res, next) => {
  try {
    const data = await ReportService.getResultReport(req.params.examId);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};
