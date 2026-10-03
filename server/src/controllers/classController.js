import { ClassService } from '../services/ClassService.js';

export const getAllClasses = async (req, res, next) => {
  try {
    const classes = await ClassService.getAllClasses();
    res.json({ success: true, count: classes.length, classes });
  } catch (err) {
    next(err);
  }
};

export const getClassById = async (req, res, next) => {
  try {
    const data = await ClassService.getClassById(req.params.id);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

export const createClass = async (req, res, next) => {
  try {
    const result = await ClassService.createClass(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const updateClass = async (req, res, next) => {
  try {
    const result = await ClassService.updateClass(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteClass = async (req, res, next) => {
  try {
    const result = await ClassService.deleteClass(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Subjects
export const getAllSubjects = async (req, res, next) => {
  try {
    const subjects = await ClassService.getAllSubjects();
    res.json({ success: true, count: subjects.length, subjects });
  } catch (err) {
    next(err);
  }
};

export const createSubject = async (req, res, next) => {
  try {
    const result = await ClassService.createSubject(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const updateSubject = async (req, res, next) => {
  try {
    const result = await ClassService.updateSubject(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteSubject = async (req, res, next) => {
  try {
    const result = await ClassService.deleteSubject(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const assignSubjects = async (req, res, next) => {
  try {
    const result = await ClassService.assignSubjectsToClass(req.params.id, req.body.subjectIds);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
