import express from 'express';
import {
  getAll, getById, create, update, remove, toggleStatus, resetPassword
} from '../controllers/studentController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize, enforceStudentSelf } from '../middleware/roleGuard.js';

const router = express.Router();

router.use(authenticate);

// Admin & Teachers can list students
router.get('/', authorize('admin', 'teacher'), getAll);

// Student can view their own profile; Admin/Teacher can view any
router.get('/:id', enforceStudentSelf, getById);

// Admin operations
router.post('/', authorize('admin'), create);
router.put('/:id', authorize('admin'), update);
router.delete('/:id', authorize('admin'), remove);
router.patch('/:id/toggle-status', authorize('admin'), toggleStatus);
router.post('/:id/reset-password', authorize('admin'), resetPassword);

export default router;
