import express from 'express';
import { getAll, create, update, remove } from '../controllers/announcementController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/roleGuard.js';

const router = express.Router();

router.get('/', optionalAuth, getAll);
router.post('/', authenticate, authorize('admin'), create);
router.put('/:id', authenticate, authorize('admin'), update);
router.delete('/:id', authenticate, authorize('admin'), remove);

export default router;
