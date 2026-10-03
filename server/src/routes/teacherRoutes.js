import express from 'express';
import {
  getAll, getById, create, update, remove, assignClasses, getDashboard
} from '../controllers/teacherController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roleGuard.js';

const router = express.Router();

router.use(authenticate);

// Teacher dashboard
router.get('/dashboard', authorize('teacher', 'admin'), getDashboard);

router.get('/', authorize('admin'), getAll);
router.get('/:id', authorize('admin', 'teacher'), getById);
router.post('/', authorize('admin'), create);
router.put('/:id', authorize('admin'), update);
router.delete('/:id', authorize('admin'), remove);
router.post('/:id/assignments', authorize('admin'), assignClasses);

export default router;
