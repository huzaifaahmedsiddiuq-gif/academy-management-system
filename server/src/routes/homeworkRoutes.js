import express from 'express';
import {
  getAll, create, update, remove, submit, grade, getSubmissions
} from '../controllers/homeworkController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roleGuard.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAll);
router.post('/', authorize('admin', 'teacher'), create);
router.put('/:id', authorize('admin', 'teacher'), update);
router.delete('/:id', authorize('admin', 'teacher'), remove);

// Student submit
router.post('/:id/submit', authorize('student'), submit);

// Teacher grade
router.get('/:id/submissions', authorize('admin', 'teacher'), getSubmissions);
router.post('/:id/grade/:submissionId', authorize('admin', 'teacher'), grade);

export default router;
