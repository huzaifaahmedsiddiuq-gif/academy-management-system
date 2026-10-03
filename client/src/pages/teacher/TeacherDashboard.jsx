import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  School, Users, CalendarCheck, BookOpen, Award, ArrowUpRight,
  Plus, CheckCircle, Clock
} from 'lucide-react';
import { StatCard } from '../../components/StatCard';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { useAuth } from '../../context/AuthContext';
import { useAcademy } from '../../context/AcademyContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const { academy } = useAcademy();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/teachers/dashboard');
      if (res.data?.success) {
        setDashboardData(res.data);
      }
    } catch (e) {
      toast.error('Failed to load teacher dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSkeleton count={3} type="card" />;
  }

  const classes = dashboardData?.classes || [];
  const homework = dashboardData?.recentHomework || [];
  const totalStudents = dashboardData?.totalStudents || 0;

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-900 via-teal-950 to-surface-900 rounded-3xl text-white shadow-xl border border-emerald-800/40">
        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
          Faculty Portal
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">
          Welcome, {user?.teacher?.full_name || user?.username}!
        </h1>
        <p className="text-xs md:text-sm text-slate-300 mt-1">
          Manage your assigned classes, register daily attendance, publish assignments, and grade student submissions.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Assigned Classes"
          value={classes.length}
          icon={School}
          color="emerald"
          subtext="Active teaching groups"
        />

        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={Users}
          color="indigo"
          subtext="In your allocated cohorts"
        />

        <StatCard
          title="Active Homework"
          value={homework.length}
          icon={BookOpen}
          color="purple"
          subtext="Assignments pending evaluation"
        />
      </div>

      {/* Assigned Classes Quick Actions */}
      <div className="bg-white dark:bg-surface-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Your Assigned Classes</h3>
            <p className="text-xs text-slate-400">Direct shortcuts to take attendance or evaluate results</p>
          </div>
        </div>

        {classes.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No classes currently assigned to your account. Please ask the administrator to allocate classes.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <div
                key={cls.class_id}
                className="p-5 bg-slate-50 dark:bg-surface-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">{cls.class_name}</h4>
                  <span className="text-xs text-brand-600 font-semibold">Section {cls.section}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                  <NavLink
                    to="/teacher/attendance"
                    className="flex-1 py-1.5 text-center text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all"
                  >
                    Attendance
                  </NavLink>
                  <NavLink
                    to="/teacher/homework"
                    className="flex-1 py-1.5 text-center text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-surface-900 border rounded-xl hover:bg-slate-100"
                  >
                    Homework
                  </NavLink>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
