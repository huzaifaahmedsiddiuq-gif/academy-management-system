import { FeeService } from '../services/FeeService.js';

export const getAllFees = async (req, res, next) => {
  try {
    const { month, status, classId, search } = req.query;
    const fees = await FeeService.getAllFees({ month, status, classId, search });
    res.json({ success: true, count: fees.length, fees });
  } catch (err) {
    next(err);
  }
};

export const getFeeById = async (req, res, next) => {
  try {
    const data = await FeeService.getFeeById(req.params.id);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

export const generateMonthlyFees = async (req, res, next) => {
  try {
    const { classId, monthYear, dueDate, feeType } = req.body;
    if (!monthYear || !dueDate) throw new Error('monthYear and dueDate are required.');
    const result = await FeeService.generateMonthlyFees(classId, monthYear, dueDate, feeType);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const recordPayment = async (req, res, next) => {
  try {
    const result = await FeeService.recordPayment(req.params.id, req.body, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getStudentFeeLedger = async (req, res, next) => {
  try {
    const studentId = req.params.studentId || req.user.studentId;
    const data = await FeeService.getStudentFeeLedger(studentId);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};
