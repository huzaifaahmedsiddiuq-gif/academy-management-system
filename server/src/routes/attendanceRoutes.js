import express from 'express';
import {
  getClassDailySheet, markBatchAttendance, getStudentAttendance, getClassMonthlyReport
} from '../controllers/attendanceController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize, enforceStudentSelf } from '../middleware/roleGuard.js';

const router = express.Router();

router.use(authenticate);

// Student view
router.get('/student/:studentId', enforceStudentSelf, getStudentAttendance);

// Teacher & Admin views
router.get('/class/:classId/daily', authorize('admin', 'teacher'), getClassDailySheet);
router.post('/class/:classId/batch', authorize('admin', 'teacher'), markBatchAttendance);
router.get('/class/:classId/monthly', authorize('admin', 'teacher'), getClassMonthlyReport);

export default router;
