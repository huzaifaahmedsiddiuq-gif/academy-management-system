import express from 'express';
import { getAdminStats } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roleGuard.js';

const router = express.Router();

router.use(authenticate);
router.get('/admin', authorize('admin'), getAdminStats);

export default router;
