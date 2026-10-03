import express from 'express';
import { globalSearch } from '../controllers/searchController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roleGuard.js';

const router = express.Router();

router.use(authenticate);
router.get('/', authorize('admin'), globalSearch);

export default router;
