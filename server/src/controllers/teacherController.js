import { TeacherService } from '../services/TeacherService.js';

export const getAll = async (req, res, next) => {
  try {
    const teachers = await TeacherService.getAll();
    res.json({ success: true, count: teachers.length, teachers });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req, res, next) => {
  try {
    const data = await TeacherService.getById(req.params.id);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const result = await TeacherService.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const result = await TeacherService.update(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const result = await TeacherService.delete(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const assignClasses = async (req, res, next) => {
  try {
    const result = await TeacherService.assignClassesAndSubjects(req.params.id, req.body.assignments);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getDashboard = async (req, res, next) => {
  try {
    const teacherId = req.user.teacherId || req.params.id;
    const data = await TeacherService.getTeacherDashboard(teacherId);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};
