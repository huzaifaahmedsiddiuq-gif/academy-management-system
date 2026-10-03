import React, { useEffect, useState } from 'react';
import { CalendarCheck, Calendar, CheckCircle2, XCircle, Clock, Printer, Download, MessageSquare, Award } from 'lucide-react';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { PrintHeader, PrintFooter } from '../../components/PrintHeader';
import { WhatsAppShareModal } from '../../components/WhatsAppShareModal';
import { StatCard } from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import { useAcademy } from '../../context/AcademyContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const StudentAttendance = () => {
  const { user } = useAuth();
  const { academy } = useAcademy();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState({ percentage: 100, present: 0, absent: 0, leave: 0, total: 0, records: [] });
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // WhatsApp
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState(null);

  const studentId = user?.studentId || user?.student?.id;

  const fetchAttendance = async () => {
    if (!studentId) return;
    try {
      setLoading(true);
      const res = await api.get(`/attendance/student/${studentId}?month=${selectedMonth}`);
      if (res.data?.success) {
        setAttendanceData(res.data);
      }
    } catch (e) {
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [studentId, selectedMonth]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(academy.academy_name, 14, 20);
      doc.setFontSize(12);
      doc.text(`Official Attendance Report - ${selectedMonth}`, 14, 28);
      doc.text(`Student: ${user?.student?.full_name || user?.username} | Roll No: ${user?.student?.roll_number || 'N/A'}`, 14, 35);
      doc.text(`Total Classes: ${attendanceData.total} | Present: ${attendanceData.present} | Percentage: ${attendanceData.percentage}%`, 14, 42);

      const tableData = (attendanceData.records || []).map(r => [
        new Date(r.date).toLocaleDateString(),
        r.status.toUpperCase(),
        r.remarks || '-'
      ]);

      doc.autoTable({
        startY: 48,
        head: [['Date', 'Status', 'Remarks']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] }
      });

      doc.save(`Attendance_${user?.username}_${selectedMonth}.pdf`);
      toast.success('Attendance PDF downloaded!');
    } catch (e) {
      toast.error('Failed to generate PDF');
    }
  };

  const handleOpenWhatsApp = () => {
    setShareData({
      type: 'attendance',
      data: {
        student_name: user?.student?.full_name || user?.username,
        roll_number: user?.student?.roll_number || 'N/A',
        class_name: user?.student?.class_name || 'Assigned Class',
        percentage: attendanceData.percentage,
        total_classes: attendanceData.total,
        present: attendanceData.present,
        absent: attendanceData.absent,
        leave: attendanceData.leave,
        month: selectedMonth,
        guardian_phone: user?.student?.phone || academy.phone
      }
    });
    setShareModalOpen(true);
  };

  if (loading) return <LoadingSkeleton count={3} type="card" />;

  const records = attendanceData.records || [];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Print Official Header */}
      <PrintHeader
        title="Student Attendance Report"
        subtitle={`Academic Session: ${academy.academic_year || '2025-2026'} | Month: ${selectedMonth}`}
      />

      {/* Screen Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="w-7 h-7 text-brand-600" />
            My Attendance Record
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your daily presence, leaves, and overall academic attendance percentage.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            PDF
          </button>

          <button
            onClick={handleOpenWhatsApp}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md shadow-emerald-600/20"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Share WhatsApp
          </button>
        </div>
      </div>

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Rate"
          value={`${attendanceData.percentage}%`}
          icon={Award}
          color={attendanceData.percentage >= 75 ? 'emerald' : 'rose'}
          subtext={attendanceData.percentage >= 75 ? 'Good Academic Standing' : 'Below 75% Requirement'}
        />
        <StatCard
          title="Total Classes"
          value={attendanceData.total}
          icon={Calendar}
          color="indigo"
          subtext={`Conducted in ${selectedMonth}`}
        />
        <StatCard
          title="Present Days"
          value={attendanceData.present}
          icon={CheckCircle2}
          color="emerald"
          subtext="Marked in classroom"
        />
        <StatCard
          title="Absent & Leaves"
          value={Number(attendanceData.absent) + Number(attendanceData.leave)}
          icon={XCircle}
          color="amber"
          subtext={`${attendanceData.absent} Absents • ${attendanceData.leave} Leaves`}
        />
      </div>

      {/* Attendance Sheet Table */}
      <div className="bg-white dark:bg-surface-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden printable-card">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Daily Attendance Log</h3>
          <p className="text-xs text-slate-400">Class records for {selectedMonth}</p>
        </div>

        {records.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No attendance records found for this period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-surface-800/60 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Day</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {records.map((r, i) => {
                  const dateObj = new Date(r.date);
                  return (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-surface-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-medium">
                        {dateObj.toLocaleDateString(undefined, { weekday: 'long' })}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            r.status === 'present'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                              : r.status === 'absent'
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {r.status === 'present' && <CheckCircle2 className="w-3 h-3" />}
                          {r.status === 'absent' && <XCircle className="w-3 h-3" />}
                          {r.status === 'leave' && <Clock className="w-3 h-3" />}
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {r.remarks || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PrintFooter />

      {/* WhatsApp Modal */}
      {shareModalOpen && shareData && (
        <WhatsAppShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          shareType={shareData.type}
          data={shareData.data}
        />
      )}
    </div>
  );
};
