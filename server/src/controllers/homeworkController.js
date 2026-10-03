import { HomeworkService } from '../services/HomeworkService.js';

export const getAll = async (req, res, next) => {
  try {
    const { classId, teacherId } = req.query;
    const studentId = req.user.role === 'student' ? req.user.studentId : req.query.studentId;
    const homework = await HomeworkService.getAll({ classId, teacherId, studentId });
    res.json({ success: true, count: homework.length, homework });
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const teacherId = req.user.role === 'teacher' ? req.user.teacherId : req.body.teacher_id;
    const result = await HomeworkService.create({ ...req.body, teacher_id: teacherId });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const result = await HomeworkService.update(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const result = await HomeworkService.delete(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const submit = async (req, res, next) => {
  try {
    const studentId = req.user.role === 'student' ? req.user.studentId : req.body.student_id;
    const result = await HomeworkService.submitHomework(req.params.id, studentId, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const grade = async (req, res, next) => {
  try {
    const result = await HomeworkService.gradeSubmission(req.params.submissionId, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getSubmissions = async (req, res, next) => {
  try {
    const submissions = await HomeworkService.getSubmissions(req.params.id);
    res.json({ success: true, count: submissions.length, submissions });
  } catch (err) {
    next(err);
  }
};
