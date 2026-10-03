import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AcademyProvider } from './context/AcademyContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

// Layout & Protected Route
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StudentsPage } from './pages/admin/StudentsPage';
import { TeachersPage } from './pages/admin/TeachersPage';
import { ClassesPage } from './pages/admin/ClassesPage';
import { AttendancePage } from './pages/admin/AttendancePage';
import { ResultsPage } from './pages/admin/ResultsPage';
import { HomeworkPage } from './pages/admin/HomeworkPage';
import { StudyMaterialPage } from './pages/admin/StudyMaterialPage';
import { FeesPage } from './pages/admin/FeesPage';
import { AnnouncementsPage } from './pages/admin/AnnouncementsPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { SettingsPage } from './pages/admin/SettingsPage';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentAttendance } from './pages/student/StudentAttendance';
import { StudentResults } from './pages/student/StudentResults';
import { StudentHomework } from './pages/student/StudentHomework';
import { StudentFees } from './pages/student/StudentFees';
import { StudentProfile } from './pages/student/StudentProfile';

const RootRedirect = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-surface-950">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  if (role === 'student') return <Navigate to="/student/dashboard" replace />;

  return <Navigate to="/login" replace />;
};

export const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AcademyProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Route */}
                <Route path="/login" element={<LoginPage />} />

                {/* Root Redirection */}
                <Route path="/" element={<RootRedirect />} />

                {/* Protected Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route element={<Layout />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/students" element={<StudentsPage />} />
                    <Route path="/admin/teachers" element={<TeachersPage />} />
                    <Route path="/admin/classes" element={<ClassesPage />} />
                    <Route path="/admin/attendance" element={<AttendancePage />} />
                    <Route path="/admin/results" element={<ResultsPage />} />
                    <Route path="/admin/homework" element={<HomeworkPage />} />
                    <Route path="/admin/study-material" element={<StudyMaterialPage />} />
                    <Route path="/admin/fees" element={<FeesPage />} />
                    <Route path="/admin/announcements" element={<AnnouncementsPage />} />
                    <Route path="/admin/reports" element={<ReportsPage />} />
                    <Route path="/admin/settings" element={<SettingsPage />} />
                  </Route>
                </Route>

                {/* Protected Teacher Routes */}
                <Route element={<ProtectedRoute allowedRoles={['teacher', 'admin']} />}>
                  <Route element={<Layout />}>
                    <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                    <Route path="/teacher/classes" element={<ClassesPage />} />
                    <Route path="/teacher/attendance" element={<AttendancePage />} />
                    <Route path="/teacher/homework" element={<HomeworkPage />} />
                    <Route path="/teacher/results" element={<ResultsPage />} />
                    <Route path="/teacher/study-material" element={<StudyMaterialPage />} />
                    <Route path="/teacher/announcements" element={<AnnouncementsPage />} />
                  </Route>
                </Route>

                {/* Protected Student Routes */}
                <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                  <Route element={<Layout />}>
                    <Route path="/student/dashboard" element={<StudentDashboard />} />
                    <Route path="/student/attendance" element={<StudentAttendance />} />
                    <Route path="/student/results" element={<StudentResults />} />
                    <Route path="/student/homework" element={<StudentHomework />} />
                    <Route path="/student/study-material" element={<StudyMaterialPage />} />
                    <Route path="/student/fees" element={<StudentFees />} />
                    <Route path="/student/announcements" element={<AnnouncementsPage />} />
                    <Route path="/student/profile" element={<StudentProfile />} />
                  </Route>
                </Route>

                {/* Catch-all fallback */}
                <Route path="*" element={<RootRedirect />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </AcademyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
