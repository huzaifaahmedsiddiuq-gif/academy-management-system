import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import db from './database/index.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import classRoutes from './routes/classRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
import homeworkRoutes from './routes/homeworkRoutes.js';
import studyMaterialRoutes from './routes/studyMaterialRoutes.js';
import feeRoutes from './routes/feeRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import whatsappRoutes from './routes/whatsappRoutes.js';
import searchRoutes from './routes/searchRoutes.js';

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health and DB Provider status
app.get('/api/health', async (req, res) => {
  const provider = db.getProvider();
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    databaseProvider: provider
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/study-materials', studyMaterialRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/search', searchRoutes);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `API Endpoint [${req.method} ${req.originalUrl}] not found.` });
});

// Central Error Handler
app.use(errorHandler);

export default app;
