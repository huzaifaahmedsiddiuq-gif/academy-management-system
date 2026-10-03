import { ResultService } from '../services/ResultService.js';

export const getExams = async (req, res, next) => {
  try {
    const { classId } = req.query;
    const exams = await ResultService.getExams(classId);
    res.json({ success: true, count: exams.length, exams });
  } catch (err) {
    next(err);
  }
};

export const createExam = async (req, res, next) => {
  try {
    const result = await ResultService.createExam(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const updateExam = async (req, res, next) => {
  try {
    const result = await ResultService.updateExam(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteExam = async (req, res, next) => {
  try {
    const result = await ResultService.deleteExam(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const togglePublish = async (req, res, next) => {
  try {
    const result = await ResultService.togglePublish(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getMarksheet = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const { subjectId } = req.query;
    const data = await ResultService.getExamMarksheet(examId, subjectId);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

export const saveMarksBatch = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const { marks } = req.body;
    const result = await ResultService.saveMarksBatch(examId, marks);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getStudentResults = async (req, res, next) => {
  try {
    const studentId = req.params.studentId || req.user.studentId;
    const results = await ResultService.getStudentResults(studentId);
    res.json({ success: true, count: results.length, results });
  } catch (err) {
    next(err);
  }
};
