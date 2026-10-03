import { StudyMaterialService } from '../services/StudyMaterialService.js';

export const getAll = async (req, res, next) => {
  try {
    const { classId, subjectId, materialType, search } = req.query;
    const materials = await StudyMaterialService.getAll({ classId, subjectId, materialType, search });
    res.json({ success: true, count: materials.length, materials });
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const teacherId = req.user.role === 'teacher' ? req.user.teacherId : req.body.teacher_id;
    const result = await StudyMaterialService.create({ ...req.body, teacher_id: teacherId });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const result = await StudyMaterialService.update(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const result = await StudyMaterialService.delete(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
