import express from 'express';
import { getStudentReport, getFeeReport, getResultReport } from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize, enforceStudentSelf } from '../middleware/roleGuard.js';

const router = express.Router();

router.use(authenticate);

router.get('/student/:studentId', enforceStudentSelf, getStudentReport);
router.get('/fees', authorize('admin'), getFeeReport);
router.get('/results/:examId', authorize('admin', 'teacher'), getResultReport);

export default router;
