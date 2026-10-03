import express from 'express';
import {
  getAllFees, getFeeById, generateMonthlyFees, recordPayment, getStudentFeeLedger
} from '../controllers/feeController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize, enforceStudentSelf } from '../middleware/roleGuard.js';

const router = express.Router();

router.use(authenticate);

// Student ledger (strictly own data for students)
router.get('/student/:studentId', enforceStudentSelf, getStudentFeeLedger);

// Admin operations
router.get('/', authorize('admin'), getAllFees);
router.get('/:id', authorize('admin'), getFeeById);
router.post('/generate-monthly', authorize('admin'), generateMonthlyFees);
router.post('/:id/payments', authorize('admin'), recordPayment);

export default router;
