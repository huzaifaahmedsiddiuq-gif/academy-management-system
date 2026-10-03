import express from 'express';
import {
  getAllClasses, getClassById, createClass, updateClass, deleteClass,
  getAllSubjects, createSubject, updateSubject, deleteSubject, assignSubjects
} from '../controllers/classController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roleGuard.js';

const router = express.Router();

router.use(authenticate);

// Classes
router.get('/', getAllClasses);
router.get('/:id', getClassById);
router.post('/', authorize('admin'), createClass);
router.put('/:id', authorize('admin'), updateClass);
router.delete('/:id', authorize('admin'), deleteClass);

// Subjects
router.get('/subjects/all', getAllSubjects);
router.post('/subjects', authorize('admin'), createSubject);
router.put('/subjects/:id', authorize('admin'), updateSubject);
router.delete('/subjects/:id', authorize('admin'), deleteSubject);
router.post('/:id/subjects', authorize('admin'), assignSubjects);

export default router;
