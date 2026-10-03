import { AnnouncementService } from '../services/AnnouncementService.js';

export const getAll = async (req, res, next) => {
  try {
    const role = req.user ? req.user.role : 'all';
    const classId = req.user && req.user.role === 'student' ? req.user.classId : null;
    const isAdmin = req.user && req.user.role === 'admin';
    const announcements = await AnnouncementService.getAll({ role, classId, isAdmin });
    res.json({ success: true, count: announcements.length, announcements });
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const result = await AnnouncementService.create(req.body, req.user.id);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const result = await AnnouncementService.update(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const result = await AnnouncementService.delete(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
