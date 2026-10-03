import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, School, CalendarCheck, Award,
  BookOpen, FileText, CreditCard, Bell, BarChart3, Settings,
  LogOut, X, ChevronRight, BookMarked
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAcademy } from '../context/AcademyContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, role, logout } = useAuth();
  const { academy } = useAcademy();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminNav = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Students', path: '/admin/students', icon: Users },
    { label: 'Teachers', path: '/admin/teachers', icon: GraduationCap },
    { label: 'Classes & Subjects', path: '/admin/classes', icon: School },
    { label: 'Attendance', path: '/admin/attendance', icon: CalendarCheck },
    { label: 'Exams & Results', path: '/admin/results', icon: Award },
    { label: 'Homework', path: '/admin/homework', icon: BookOpen },
    { label: 'Study Material', path: '/admin/study-material', icon: BookMarked },
    { label: 'Fee Management', path: '/admin/fees', icon: CreditCard },
    { label: 'Announcements', path: '/admin/announcements', icon: Bell },
    { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { label: 'Academy Settings', path: '/admin/settings', icon: Settings },
  ];

  const teacherNav = [
    { label: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
    { label: 'My Classes', path: '/teacher/classes', icon: School },
    { label: 'Mark Attendance', path: '/teacher/attendance', icon: CalendarCheck },
    { label: 'Homework', path: '/teacher/homework', icon: BookOpen },
    { label: 'Enter Results', path: '/teacher/results', icon: Award },
    { label: 'Study Material', path: '/teacher/study-material', icon: BookMarked },
    { label: 'Announcements', path: '/teacher/announcements', icon: Bell },
  ];

  const studentNav = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Attendance', path: '/student/attendance', icon: CalendarCheck },
    { label: 'My Results', path: '/student/results', icon: Award },
    { label: 'Homework', path: '/student/homework', icon: BookOpen },
    { label: 'Study Material', path: '/student/study-material', icon: BookMarked },
    { label: 'Fees & Receipts', path: '/student/fees', icon: CreditCard },
    { label: 'Announcements', path: '/student/announcements', icon: Bell },
    { label: 'My Profile', path: '/student/profile', icon: Users },
  ];

  const links = role === 'admin' ? adminNav : role === 'teacher' ? teacherNav : studentNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-72 bg-white dark:bg-surface-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {academy.logo_url ? (
              <img src={academy.logo_url} alt="Logo" className="w-10 h-10 object-contain rounded-lg" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
                <School className="w-5 h-5" />
              </div>
            )}
            <div className="truncate">
              <h2 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight truncate">
                {academy.academy_name}
              </h2>
              <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                {role} Portal
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-surface-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {links.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-800 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-surface-800 mb-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-300 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                {user?.username?.slice(0, 2) || 'AC'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">
                  {user?.username || 'User'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
