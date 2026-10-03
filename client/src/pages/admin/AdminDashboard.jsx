import React, { useEffect, useState } from 'react';
import {
  Users, UserCheck, GraduationCap, CalendarCheck, CreditCard,
  AlertCircle, BookOpen, ArrowUpRight, MessageSquare, TrendingUp
} from 'lucide-react';
import { StatCard } from '../../components/StatCard';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { WhatsAppShareModal } from '../../components/WhatsAppShareModal';
import { useAcademy } from '../../context/AcademyContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState(null);
  const { academy } = useAcademy();
  const toast = useToast();

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard/admin');
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleShareReceipt = async (feeId) => {
    try {
      const res = await api.get(`/whatsapp/fee/${feeId}`);
      if (res.data?.success) {
        setShareData(res.data);
        setShareModalOpen(true);
      }
    } catch (err) {
      toast.error('Could not generate WhatsApp receipt');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-200 dark:bg-surface-800 rounded animate-pulse" />
        <LoadingSkeleton count={4} type="card" />
        <LoadingSkeleton type="table" />
      </div>
    );
  }

  const cards = data?.cards || {};
  const currency = academy.currency_symbol || 'Rs.';

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-brand-900 via-indigo-950 to-surface-900 rounded-3xl text-white shadow-xl border border-brand-800/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-brand-500/20 text-brand-300 text-xs font-semibold rounded-full border border-brand-500/30">
              Academic Year {academy.academic_year}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">
            Executive Control Center
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
            Live metrics, financial oversight, student tracking, and automated communication.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 text-right">
            <p className="text-[10px] uppercase tracking-wider text-brand-200">Total Fees Collected</p>
            <p className="text-xl font-extrabold text-white mt-0.5">
              {currency} {Number(cards.totalCollected || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Students"
          value={cards.totalStudents || 0}
          icon={Users}
          color="indigo"
          subtext={`${cards.activeStudents || 0} currently enrolled`}
          trend="+12% this term"
        />

        <StatCard
          title="Faculty Teachers"
          value={cards.totalTeachers || 0}
          icon={GraduationCap}
          color="purple"
          subtext="Assigned across all grades"
        />

        <StatCard
          title="Today's Attendance"
          value={`${cards.todayAttendancePct || 0}%`}
          icon={CalendarCheck}
          color="emerald"
          subtext={`${cards.todayPresent || 0} students present today`}
        />

        <StatCard
          title="Outstanding Fees"
          value={`${currency} ${Number(cards.totalOutstanding || 0).toLocaleString()}`}
          icon={CreditCard}
          color="amber"
          subtext="Pending collection"
        />
      </div>

      {/* Charts & Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Fee Collection Trend Bar */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-surface-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Monthly Fee Collection Trend</h3>
              <p className="text-xs text-slate-400">Real-time payment aggregations</p>
            </div>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          {/* Simple Dynamic SVG Bar Visualizer */}
          <div className="h-48 flex items-end justify-between gap-4 pt-4 border-b border-slate-100 dark:border-slate-800">
            {(!data?.monthlyFeeChart || data.monthlyFeeChart.length === 0) ? (
              <p className="text-xs text-slate-400 m-auto">No payment records yet</p>
            ) : (
              data.monthlyFeeChart.map((item, idx) => {
                const maxVal = Math.max(...data.monthlyFeeChart.map(m => Number(m.collected || 0)), 1);
                const heightPct = Math.max(15, (Number(item.collected || 0) / maxVal) * 100);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      {currency}{Number(item.collected).toLocaleString()}
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full max-w-[48px] bg-gradient-to-t from-brand-600 to-indigo-400 rounded-t-xl group-hover:brightness-110 transition-all shadow-md shadow-brand-500/10"
                    />
                    <span className="text-[11px] font-medium text-slate-400 mt-2 truncate w-full text-center">
                      {item.month_label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming Exams Panel */}
        <div className="p-6 bg-white dark:bg-surface-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Upcoming Exams</h3>
              <span className="text-xs text-brand-600 font-semibold">{data?.upcomingExams?.length || 0} scheduled</span>
            </div>

            <div className="space-y-3">
              {(!data?.upcomingExams || data.upcomingExams.length === 0) ? (
                <p className="text-xs text-slate-400 py-6 text-center">No upcoming exams</p>
              ) : (
                data.upcomingExams.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-3 bg-slate-50 dark:bg-surface-800 rounded-2xl flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{ex.title}</p>
                      <p className="text-[11px] text-slate-400">{ex.class_name} ({ex.section})</p>
                    </div>
                    <span className="text-[11px] font-mono font-semibold px-2 py-1 rounded bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
                      {new Date(ex.exam_date).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments & Recent Students Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments with 1-click WhatsApp receipt share */}
        <div className="p-6 bg-white dark:bg-surface-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Recent Payments</h3>
              <p className="text-xs text-slate-400">Latest recorded fee receipts</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {(!data?.recentPayments || data.recentPayments.length === 0) ? (
              <p className="text-xs text-slate-400 py-6 text-center">No recent payments recorded</p>
            ) : (
              data.recentPayments.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{p.student_name}</p>
                    <p className="text-xs text-slate-400">
                      Roll: {p.roll_number} | {p.month_year} | Receipt: {p.receipt_number}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                      +{currency} {Number(p.amount).toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleShareReceipt(p.fee_id)}
                      title="Share Receipt on WhatsApp"
                      className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-xl transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Student Enrollments */}
        <div className="p-6 bg-white dark:bg-surface-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Recent Enrollments</h3>
              <p className="text-xs text-slate-400">Newly admitted students</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {(!data?.recentStudents || data.recentStudents.length === 0) ? (
              <p className="text-xs text-slate-400 py-6 text-center">No enrolled students found</p>
            ) : (
              data.recentStudents.map((s) => (
                <div key={s.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-950/50 text-brand-600 font-bold text-xs flex items-center justify-center">
                      {s.full_name?.slice(0, 2) || 'ST'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{s.full_name}</p>
                      <p className="text-xs text-slate-400">{s.class_name} | Roll: {s.roll_number}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                    Active
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* WhatsApp Modal */}
      <WhatsAppShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareData={shareData}
        title="Share Fee Receipt on WhatsApp"
      />
    </div>
  );
};
