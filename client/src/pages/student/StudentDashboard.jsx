import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  CalendarCheck, Award, BookOpen, CreditCard, Bell, BookMarked,
  ArrowRight, CheckCircle2, AlertCircle, Clock, Sparkles
} from 'lucide-react';
import { StatCard } from '../../components/StatCard';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { useAuth } from '../../context/AuthContext';
import { useAcademy } from '../../context/AcademyContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const StudentDashboard = () => {
  const { user, studentId: authStudentId } = useAuth();
  const { academy } = useAcademy();
  const toast = useToast();

  const studentId = authStudentId || user?.studentId || user?.student?.id || user?.profile?.id || (user?.role === 'student' ? user?.id : null);
  const cachedStudent = user?.student || user?.profile || null;

  // Optimistic initial state from cached user data for instant 0ms load
  const [studentData, setStudentData] = useState(() => cachedStudent ? { student: cachedStudent } : null);
  const [loading, setLoading] = useState(() => !cachedStudent);

  const fetchStudentProfile = async () => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    try {
      if (!studentData) setLoading(true);
      const res = await api.get(`/students/${studentId}`);
      if (res.data?.success) {
        setStudentData(res.data);
      }
    } catch (e) {
      toast.error('Failed to load student portal dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentProfile();
  }, [studentId]);

  if (loading && !studentData) {
    return <LoadingSkeleton count={4} type="card" />;
  }

  const student = studentData?.student || user?.student || {};
  const attendance = studentData?.attendance || { percentage: 100, present: 0, total: 0 };
  const fees = studentData?.fees || [];
  const results = studentData?.results || [];

  const pendingFees = fees.filter(f => f.status !== 'paid');
  const latestFee = fees[0];
  const latestResult = results[0];
  const currency = academy.currency_symbol || 'Rs.';

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Student Profile Hero Header */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-brand-900 via-indigo-950 to-surface-900 rounded-3xl text-white shadow-xl border border-brand-800/40 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 text-center md:text-left">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-500 to-indigo-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-brand-500/30 flex-shrink-0">
            {student.full_name?.slice(0, 2) || 'ST'}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
              <span className="px-3 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-mono text-xs font-bold border border-brand-500/30">
                {student.roll_number}
              </span>
              <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                Active Scholar
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">
              {student.full_name}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1">
              Class: <strong>{student.class_name || 'Enrolled Grade'} ({student.section || 'A'})</strong> • Guardian: {student.father_name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 text-center">
            <span className="text-[10px] uppercase font-bold text-brand-300 block">Attendance Score</span>
            <span className="text-2xl font-extrabold text-emerald-400 mt-0.5">{attendance.percentage}%</span>
          </div>
        </div>
      </div>

      {/* Dynamic Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Attendance Rate"
          value={`${attendance.percentage}%`}
          icon={CalendarCheck}
          color="emerald"
          subtext={`${attendance.present} classes attended`}
        />

        <StatCard
          title="Fee Status"
          value={pendingFees.length === 0 ? 'Clear' : 'Pending'}
          icon={CreditCard}
          color={pendingFees.length === 0 ? 'emerald' : 'amber'}
          subtext={pendingFees.length > 0 ? `${pendingFees.length} voucher pending` : 'All cleared'}
        />

        <StatCard
          title="Latest Result"
          value={latestResult ? `${latestResult.obtained_marks}/${latestResult.total_marks}` : 'N/A'}
          icon={Award}
          color="indigo"
          subtext={latestResult ? `${latestResult.subject_name} (${latestResult.grade})` : 'No exam yet'}
        />

        <StatCard
          title="Academic Session"
          value={academy.academic_year || '2026'}
          icon={Sparkles}
          color="purple"
          subtext={academy.academy_name}
        />
      </div>

      {/* Recent Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Results & Exam History */}
        <div className="p-6 bg-white dark:bg-surface-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Exam Result Cards</h3>
                <p className="text-xs text-slate-400">Published scores and teacher feedback</p>
              </div>
              <NavLink
                to="/student/results"
                className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </NavLink>
            </div>

            {results.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No published results yet.</p>
            ) : (
              <div className="space-y-3">
                {results.slice(0, 4).map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 bg-slate-50 dark:bg-surface-800 rounded-2xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{r.subject_name}</h4>
                      <p className="text-[11px] text-slate-400">{r.exam_title}</p>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-sm text-brand-600 dark:text-brand-400">
                        {r.obtained_marks} / {r.total_marks}
                      </span>
                      <span className="ml-2 font-bold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600">
                        {r.grade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Fee Billing History */}
        <div className="p-6 bg-white dark:bg-surface-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Fee Statements</h3>
                <p className="text-xs text-slate-400">Tuition fee vouchers and receipts</p>
              </div>
              <NavLink
                to="/student/fees"
                className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
              >
                <span>View Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </NavLink>
            </div>

            {fees.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No fee vouchers recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {fees.slice(0, 4).map((f) => (
                  <div
                    key={f.id}
                    className="p-3.5 bg-slate-50 dark:bg-surface-800 rounded-2xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{f.month_year}</h4>
                      <p className="text-[11px] text-slate-400">{f.fee_type}</p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-slate-800 dark:text-white">
                        {currency} {Number(f.total_amount).toLocaleString()}
                      </p>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          f.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        {f.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
