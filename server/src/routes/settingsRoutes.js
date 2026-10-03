import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roleGuard.js';

const router = express.Router();

// Settings are public so login/dashboard/branding can load before authentication
router.get('/', getSettings);
router.put('/', authenticate, authorize('admin'), updateSettings);

export default router;
