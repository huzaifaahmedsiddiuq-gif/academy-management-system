import React, { useEffect, useState } from 'react';
import {
  CalendarCheck, Calendar, Users, Check, X, AlertCircle,
  Save, Printer, MessageSquare, ChevronRight, BarChart2
} from 'lucide-react';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { WhatsAppShareModal } from '../../components/WhatsAppShareModal';
import { PrintHeader, PrintFooter } from '../../components/PrintHeader';
import { useAcademy } from '../../context/AcademyContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const AttendancePage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentsSheet, setStudentsSheet] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Monthly summary
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'monthly'
  const [monthlyData, setMonthlyData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // WhatsApp Modal
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState(null);

  const { academy } = useAcademy();
  const toast = useToast();

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      if (res.data?.success && res.data.classes?.length > 0) {
        setClasses(res.data.classes);
        setSelectedClass(res.data.classes[0].id);
      }
    } catch (e) {}
  };

  const fetchDailySheet = async () => {
    if (!selectedClass) return;
    try {
      setLoading(true);
      const res = await api.get(`/attendance/class/${selectedClass}/daily?date=${attendanceDate}`);
      if (res.data?.success) {
        setStudentsSheet(res.data.students || []);
      }
    } catch (e) {
      toast.error('Failed to load attendance sheet');
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyReport = async () => {
    if (!selectedClass) return;
    try {
      setLoading(true);
      const res = await api.get(`/attendance/class/${selectedClass}/monthly?month=${selectedMonth}`);
      if (res.data?.success) {
        setMonthlyData(res.data.students || []);
      }
    } catch (e) {
      toast.error('Failed to load monthly attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (viewMode === 'daily') {
      fetchDailySheet();
    } else {
      fetchMonthlyReport();
    }
  }, [selectedClass, attendanceDate, selectedMonth, viewMode]);

  const handleStatusChange = (studentId, newStatus) => {
    setStudentsSheet((prev) =>
      prev.map((s) => (s.student_id === studentId ? { ...s, status: newStatus } : s))
    );
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const records = studentsSheet.map((s) => ({
        student_id: s.student_id,
        status: s.status,
        remarks: s.remarks || ''
      }));

      await api.post(`/attendance/class/${selectedClass}/batch`, {
        date: attendanceDate,
        records
      });

      toast.success('Attendance recorded successfully!');
    } catch (e) {
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const handleShareWhatsApp = async (studentId) => {
    try {
      const res = await api.get(`/whatsapp/attendance/${studentId}?month=${selectedMonth}`);
      if (res.data?.success) {
        setShareData(res.data);
        setShareModalOpen(true);
      }
    } catch (e) {
      toast.error('Failed to generate attendance summary');
    }
  };

  // Aggregate stats
  const total = studentsSheet.length;
  const presentCount = studentsSheet.filter((s) => s.status === 'present').length;
  const absentCount = studentsSheet.filter((s) => s.status === 'absent').length;
  const leaveCount = studentsSheet.filter((s) => s.status === 'leave').length;
  const attendanceRate = total > 0 ? ((presentCount / total) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Attendance Monitoring & Register
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Record daily classroom attendance, track monthly metrics, and notify parents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 dark:bg-surface-800 p-1 rounded-2xl flex items-center">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                viewMode === 'daily'
                  ? 'bg-white dark:bg-surface-900 text-brand-600 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Daily Register
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                viewMode === 'monthly'
                  ? 'bg-white dark:bg-surface-900 text-brand-600 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Monthly Summary
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="p-2.5 text-slate-700 dark:text-slate-300 bg-white dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 shadow-sm"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Class & Date Controls */}
      <div className="p-4 bg-white dark:bg-surface-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap gap-4 items-center justify-between no-print">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-semibold text-slate-800 dark:text-white"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.section})
                </option>
              ))}
            </select>
          </div>

          {viewMode === 'daily' ? (
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Attendance Date</label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-medium"
              />
            </div>
          ) : (
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Select Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-medium"
              />
            </div>
          )}
        </div>

        {viewMode === 'daily' && (
          <button
            onClick={handleSaveAttendance}
            disabled={saving || studentsSheet.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Sheet...' : 'Save Attendance'}</span>
          </button>
        )}
      </div>

      {/* Aggregate Daily Summary Counters */}
      {viewMode === 'daily' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 no-print">
          <div className="p-4 bg-white dark:bg-surface-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Students</span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{total}</p>
          </div>
          <div className="p-4 bg-white dark:bg-surface-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold text-emerald-500 uppercase">Present</span>
            <p className="text-xl font-extrabold text-emerald-600 mt-1">{presentCount}</p>
          </div>
          <div className="p-4 bg-white dark:bg-surface-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold text-rose-500 uppercase">Absent</span>
            <p className="text-xl font-extrabold text-rose-600 mt-1">{absentCount}</p>
          </div>
          <div className="p-4 bg-white dark:bg-surface-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold text-brand-500 uppercase">Attendance Rate</span>
            <p className="text-xl font-extrabold text-brand-600 mt-1">{attendanceRate}%</p>
          </div>
        </div>
      )}

      {/* Print Document Header */}
      <PrintHeader
        title={`ATTENDANCE REGISTER - ${viewMode === 'daily' ? attendanceDate : selectedMonth}`}
      />

      {/* Daily Attendance Sheet Table */}
      {viewMode === 'daily' && (
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden printable-card">
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton type="table" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-surface-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Roll No</th>
                    <th className="px-5 py-3.5">Student Name</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                    <th className="px-5 py-3.5">Remarks</th>
                    <th className="px-5 py-3.5 text-right no-print">Quick Notify</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {studentsSheet.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-5 py-8 text-center text-slate-400">
                        No students enrolled in this class.
                      </td>
                    </tr>
                  ) : (
                    studentsSheet.map((s) => (
                      <tr key={s.student_id} className="hover:bg-slate-50/50 dark:hover:bg-surface-800/40">
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                          {s.roll_number}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                          {s.full_name}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-surface-800 border border-slate-200 dark:border-slate-700">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(s.student_id, 'present')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                s.status === 'present'
                                  ? 'bg-emerald-500 text-white shadow-sm'
                                  : 'text-slate-500 hover:text-emerald-600'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(s.student_id, 'absent')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                s.status === 'absent'
                                  ? 'bg-rose-500 text-white shadow-sm'
                                  : 'text-slate-500 hover:text-rose-600'
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(s.student_id, 'leave')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                s.status === 'leave'
                                  ? 'bg-amber-500 text-white shadow-sm'
                                  : 'text-slate-500 hover:text-amber-600'
                              }`}
                            >
                              Leave
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <input
                            type="text"
                            value={s.remarks || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setStudentsSheet((prev) =>
                                prev.map((item) =>
                                  item.student_id === s.student_id ? { ...item, remarks: val } : item
                                )
                              );
                            }}
                            placeholder="Optional note..."
                            className="w-full px-2 py-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-brand-500 focus:outline-none text-xs"
                          />
                        </td>
                        <td className="px-5 py-3.5 text-right no-print">
                          <button
                            onClick={() => handleShareWhatsApp(s.student_id)}
                            title="Share on WhatsApp"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-surface-800 rounded-lg"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Monthly Attendance Report Table */}
      {viewMode === 'monthly' && (
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden printable-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-surface-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Roll No</th>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5 text-center">Classes Conducted</th>
                  <th className="px-5 py-3.5 text-center text-emerald-600">Present</th>
                  <th className="px-5 py-3.5 text-center text-rose-600">Absent</th>
                  <th className="px-5 py-3.5 text-center text-amber-600">Leave</th>
                  <th className="px-5 py-3.5 text-center">Percentage</th>
                  <th className="px-5 py-3.5 text-right no-print">WhatsApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {monthlyData.map((m) => (
                  <tr key={m.student_id} className="hover:bg-slate-50/50 dark:hover:bg-surface-800/40">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                      {m.roll_number}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                      {m.full_name}
                    </td>
                    <td className="px-5 py-3.5 text-center">{m.total_days}</td>
                    <td className="px-5 py-3.5 text-center font-bold text-emerald-600">{m.present_count}</td>
                    <td className="px-5 py-3.5 text-center font-bold text-rose-600">{m.absent_count}</td>
                    <td className="px-5 py-3.5 text-center font-bold text-amber-600">{m.leave_count}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          Number(m.percentage) >= 80
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                            : Number(m.percentage) >= 70
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600'
                        }`}
                      >
                        {m.percentage}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right no-print">
                      <button
                        onClick={() => handleShareWhatsApp(m.student_id)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <PrintFooter />

      {/* WhatsApp Modal */}
      <WhatsAppShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareData={shareData}
        title="Share Attendance Summary on WhatsApp"
      />
    </div>
  );
};
