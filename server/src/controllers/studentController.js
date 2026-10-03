import { StudentService } from '../services/StudentService.js';

export const getAll = async (req, res, next) => {
  try {
    const { search, classId, status, page, limit } = req.query;
    const students = await StudentService.getAll({ search, classId, status, page, limit });
    res.json({ success: true, count: students.length, students });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req, res, next) => {
  try {
    const data = await StudentService.getById(req.params.id);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const result = await StudentService.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const result = await StudentService.update(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const result = await StudentService.delete(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const toggleStatus = async (req, res, next) => {
  try {
    const result = await StudentService.toggleStatus(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const result = await StudentService.resetPassword(req.params.id, req.body.password);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
