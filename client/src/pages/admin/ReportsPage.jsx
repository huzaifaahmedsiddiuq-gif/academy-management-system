import React, { useEffect, useState } from 'react';
import {
  BarChart3, Printer, Download, MessageSquare, Search,
  Users, CreditCard, Award, CalendarCheck, FileSpreadsheet
} from 'lucide-react';
import { PrintHeader, PrintFooter } from '../../components/PrintHeader';
import { WhatsAppShareModal } from '../../components/WhatsAppShareModal';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { useAcademy } from '../../context/AcademyContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const ReportsPage = () => {
  const [reportType, setReportType] = useState('fees'); // 'fees', 'student', 'result'
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);

  // Filters
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Report Data
  const [feeReportData, setFeeReportData] = useState(null);
  const [studentReportData, setStudentReportData] = useState(null);
  const [resultReportData, setResultReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  // WhatsApp Share
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState(null);

  const { academy } = useAcademy();
  const toast = useToast();

  const fetchDropdowns = async () => {
    try {
      const [cRes, sRes, eRes] = await Promise.all([
        api.get('/classes'),
        api.get('/students'),
        api.get('/results/exams')
      ]);
      if (cRes.data?.success) setClasses(cRes.data.classes || []);
      if (sRes.data?.success) {
        setStudents(sRes.data.students || []);
        if (sRes.data.students.length > 0) setSelectedStudent(sRes.data.students[0].id);
      }
      if (eRes.data?.success) {
        setExams(eRes.data.exams || []);
        if (eRes.data.exams.length > 0) setSelectedExam(eRes.data.exams[0].id);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      if (reportType === 'fees') {
        const query = new URLSearchParams();
        if (selectedClass) query.append('classId', selectedClass);
        if (selectedMonth) query.append('month', selectedMonth);
        if (selectedStatus) query.append('status', selectedStatus);

        const res = await api.get(`/reports/fees?${query.toString()}`);
        if (res.data?.success) setFeeReportData(res.data);
      } else if (reportType === 'student' && selectedStudent) {
        const res = await api.get(`/reports/student/${selectedStudent}`);
        if (res.data?.success) setStudentReportData(res.data);
      } else if (reportType === 'result' && selectedExam) {
        const res = await api.get(`/reports/results/${selectedExam}`);
        if (res.data?.success) setResultReportData(res.data);
      }
    } catch (e) {
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, selectedClass, selectedMonth, selectedStatus, selectedStudent, selectedExam]);

  const currency = academy.currency_symbol || 'Rs.';

  const handleShareFeeSummary = () => {
    if (!feeReportData) return;
    const s = feeReportData.summary;
    const msg = `*╔════════════════════════════╗*
*   📊  ${academy.academy_name.toUpperCase()}  *
*╚════════════════════════════╝*

*━━━━━━━━ 💵 FINANCIAL FEE REPORT ━━━━━━━━*
📅 *Generated:* ${new Date().toLocaleDateString()}

*─── 📈 COLLECTION OVERVIEW ───*
📋 *Total Vouchers:* ${s.totalVouchers}
💵 *Total Billed:* ${currency} ${s.totalBilled.toLocaleString()}
✅ *Total Collected:* ${currency} ${s.totalCollected.toLocaleString()}
⚠️ *Outstanding Dues:* ${currency} ${s.totalOutstanding.toLocaleString()}

*─── 📌 STATUS BREAKDOWN ───*
🟢 *Paid in Full:* ${s.countPaid}
🟡 *Partial Payments:* ${s.countPartial}
🔴 *Unpaid Accounts:* ${s.countUnpaid}

*──────────────────────────────*
Verified by ${academy.academy_name} Finance Desk`;

    setShareData({ messageText: msg, targetPhone: '' });
    setShareModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Comprehensive Institutional Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Searchable, printable, downloadable statements and WhatsApp summaries for fees, academics & students.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {reportType === 'fees' && (
            <button
              onClick={handleShareFeeSummary}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Share Summary</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-surface-800 p-1 rounded-2xl w-fit no-print">
        <button
          onClick={() => setReportType('fees')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            reportType === 'fees'
              ? 'bg-white dark:bg-surface-900 text-brand-600 shadow-sm'
              : 'text-slate-500'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Fee Collection Report</span>
        </button>

        <button
          onClick={() => setReportType('student')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            reportType === 'student'
              ? 'bg-white dark:bg-surface-900 text-brand-600 shadow-sm'
              : 'text-slate-500'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student 360 Statement</span>
        </button>

        <button
          onClick={() => setReportType('result')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            reportType === 'result'
              ? 'bg-white dark:bg-surface-900 text-brand-600 shadow-sm'
              : 'text-slate-500'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Examination Result Analysis</span>
        </button>
      </div>

      {/* Filter Ribbon */}
      <div className="p-4 bg-white dark:bg-surface-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap gap-3 items-center no-print">
        {reportType === 'fees' && (
          <>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.section})</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              <option value="">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </>
        )}

        {reportType === 'student' && (
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.full_name} ({s.roll_number}) - {s.class_name}</option>
            ))}
          </select>
        )}

        {reportType === 'result' && (
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.title} ({ex.class_name})</option>
            ))}
          </select>
        )}
      </div>

      {/* Print Document Header */}
      <PrintHeader
        title={`INSTITUTIONAL REPORT: ${reportType.toUpperCase()}`}
        documentNumber={`REP-${Date.now().toString().slice(-6)}`}
      />

      {/* REPORT 1: FEE COLLECTION REPORT */}
      {reportType === 'fees' && feeReportData && (
        <div className="space-y-6 printable-card">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-surface-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Billed</span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {currency} {Number(feeReportData.summary.totalBilled).toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-surface-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-500">Collected Revenue</span>
              <p className="text-xl font-extrabold text-emerald-600 mt-1">
                {currency} {Number(feeReportData.summary.totalCollected).toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-surface-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-rose-500">Outstanding Dues</span>
              <p className="text-xl font-extrabold text-rose-600 mt-1">
                {currency} {Number(feeReportData.summary.totalOutstanding).toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-surface-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-brand-500">Recovery Ratio</span>
              <p className="text-xl font-extrabold text-brand-600 mt-1">
                {feeReportData.summary.totalBilled > 0
                  ? ((feeReportData.summary.totalCollected / feeReportData.summary.totalBilled) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-surface-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Roll No</th>
                    <th className="px-5 py-3.5">Student Name</th>
                    <th className="px-5 py-3.5">Class</th>
                    <th className="px-5 py-3.5">Fee Month</th>
                    <th className="px-5 py-3.5 text-right">Billed Amount</th>
                    <th className="px-5 py-3.5 text-right text-emerald-600">Collected</th>
                    <th className="px-5 py-3.5 text-right text-rose-600">Outstanding</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {feeReportData.records.map((r) => (
                    <tr key={r.id}>
                      <td className="px-5 py-3 font-mono font-bold">{r.roll_number}</td>
                      <td className="px-5 py-3 font-semibold">{r.student_name}</td>
                      <td className="px-5 py-3">{r.class_name} ({r.section})</td>
                      <td className="px-5 py-3">{r.month_year}</td>
                      <td className="px-5 py-3 text-right font-bold">{currency} {Number(r.total_amount).toLocaleString()}</td>
                      <td className="px-5 py-3 text-right font-bold text-emerald-600">{currency} {Number(r.paid_amount).toLocaleString()}</td>
                      <td className="px-5 py-3 text-right font-bold text-rose-600">{currency} {Number(r.remaining_amount).toLocaleString()}</td>
                      <td className="px-5 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-surface-800">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2: STUDENT 360 STATEMENT */}
      {reportType === 'student' && studentReportData && (
        <div className="space-y-6 printable-card">
          <div className="p-6 bg-white dark:bg-surface-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Student Name</span>
                <strong className="text-base text-slate-900 dark:text-white">{studentReportData.student.full_name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Roll Number</span>
                <strong className="text-base font-mono text-slate-900 dark:text-white">{studentReportData.student.roll_number}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Class & Section</span>
                <strong className="text-base text-slate-900 dark:text-white">{studentReportData.student.class_name} ({studentReportData.student.section})</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Overall Attendance</span>
                <strong className="text-base text-emerald-600">{studentReportData.attendance.percentage}%</strong>
              </div>
            </div>
          </div>

          {/* Academic Results Table */}
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden p-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">Academic Performance Record</h3>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-surface-800 font-bold uppercase text-slate-500">
                <tr>
                  <th className="p-3">Examination</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3 text-center">Marks</th>
                  <th className="p-3 text-center">Percentage</th>
                  <th className="p-3 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {studentReportData.results.map((res) => (
                  <tr key={res.id}>
                    <td className="p-3 font-semibold">{res.exam_title}</td>
                    <td className="p-3">{res.subject_name}</td>
                    <td className="p-3 text-center font-bold">{res.obtained_marks} / {res.total_marks}</td>
                    <td className="p-3 text-center font-bold">{res.percentage}%</td>
                    <td className="p-3 text-center font-bold text-brand-600">{res.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 3: RESULT ANALYSIS */}
      {reportType === 'result' && resultReportData && (
        <div className="space-y-6 printable-card">
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden p-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
              {resultReportData.exam.title} - Scoreboard
            </h3>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-surface-800 font-bold uppercase text-slate-500">
                <tr>
                  <th className="p-3">Roll No</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3 text-center">Obtained Marks</th>
                  <th className="p-3 text-center">Grade</th>
                  <th className="p-3">Faculty Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {resultReportData.records.map((r) => (
                  <tr key={r.id}>
                    <td className="p-3 font-mono font-bold">{r.roll_number}</td>
                    <td className="p-3 font-semibold">{r.student_name}</td>
                    <td className="p-3">{r.subject_name}</td>
                    <td className="p-3 text-center font-bold text-slate-900 dark:text-white">
                      {r.obtained_marks} / {r.total_marks}
                    </td>
                    <td className="p-3 text-center font-bold text-brand-600">{r.grade}</td>
                    <td className="p-3 text-slate-500 italic">{r.remarks || 'Satisfactory'}</td>
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
        title="Share Institutional Summary on WhatsApp"
      />
    </div>
  );
};
