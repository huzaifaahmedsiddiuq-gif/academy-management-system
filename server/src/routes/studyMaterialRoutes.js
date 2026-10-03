import express from 'express';
import { getAll, create, update, remove } from '../controllers/studyMaterialController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roleGuard.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAll);
router.post('/', authorize('admin', 'teacher'), create);
router.put('/:id', authorize('admin', 'teacher'), update);
router.delete('/:id', authorize('admin', 'teacher'), remove);

export default router;
