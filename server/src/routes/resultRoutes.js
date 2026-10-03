import express from 'express';
import {
  getExams, createExam, updateExam, deleteExam, togglePublish,
  getMarksheet, saveMarksBatch, getStudentResults
} from '../controllers/resultController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize, enforceStudentSelf } from '../middleware/roleGuard.js';

const router = express.Router();

router.use(authenticate);

// Student results
router.get('/student/:studentId', enforceStudentSelf, getStudentResults);

// Exams
router.get('/exams', getExams);
router.post('/exams', authorize('admin', 'teacher'), createExam);
router.put('/exams/:id', authorize('admin', 'teacher'), updateExam);
router.delete('/exams/:id', authorize('admin'), deleteExam);
router.patch('/exams/:id/toggle-publish', authorize('admin'), togglePublish);

// Marksheet
router.get('/exams/:examId/marksheet', authorize('admin', 'teacher'), getMarksheet);
router.post('/exams/:examId/marks', authorize('admin', 'teacher'), saveMarksBatch);

export default router;
