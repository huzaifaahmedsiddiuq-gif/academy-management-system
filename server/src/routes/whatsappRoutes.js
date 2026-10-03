import express from 'express';
import {
  generateFeeReceiptMessage,
  generateResultMessage,
  generateAttendanceMessage
} from '../controllers/whatsappController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/fee/:feeId', generateFeeReceiptMessage);
router.get('/result/:examId/:studentId', generateResultMessage);
router.get('/attendance/:studentId', generateAttendanceMessage);

export default router;
