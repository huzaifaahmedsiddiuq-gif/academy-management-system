import React, { useEffect, useState } from 'react';
import { Award, Trophy, BookOpen, Printer, Download, MessageSquare, ChevronRight, CheckCircle2 } from 'lucide-react';
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

export const StudentResults = () => {
  const { user } = useAuth();
  const { academy } = useAcademy();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [selectedExam, setSelectedExam] = useState('all');

  // WhatsApp Modal
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState(null);

  const studentId = user?.studentId || user?.student?.id;

  const fetchResults = async () => {
    if (!studentId) return;
    try {
      setLoading(true);
      const res = await api.get(`/results/student/${studentId}`);
      if (res.data?.success) {
        setResults(res.data.results || []);
      }
    } catch (e) {
      toast.error('Failed to load exam results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [studentId]);

  const exams = Array.from(new Set(results.map(r => r.exam_title || r.exam_name || 'Academic Term')));

  const filteredResults = selectedExam === 'all'
    ? results
    : results.filter(r => (r.exam_title || r.exam_name) === selectedExam);

  // Aggregates
  const totalMaxMarks = filteredResults.reduce((acc, r) => acc + Number(r.total_marks || 0), 0);
  const totalObtainedMarks = filteredResults.reduce((acc, r) => acc + Number(r.obtained_marks || 0), 0);
  const aggregatePercentage = totalMaxMarks > 0 ? ((totalObtainedMarks / totalMaxMarks) * 100).toFixed(1) : 0;

  const calculateGrade = (pct) => {
    if (pct >= 85) return 'A*';
    if (pct >= 75) return 'A';
    if (pct >= 65) return 'B';
    if (pct >= 50) return 'C';
    if (pct >= 40) return 'D';
    return 'F';
  };

  const overallGrade = calculateGrade(aggregatePercentage);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(academy.academy_name, 14, 20);
      doc.setFontSize(12);
      doc.text(`Official Academic Transcript / Marksheet`, 14, 28);
      doc.text(`Student: ${user?.student?.full_name || user?.username} | Roll No: ${user?.student?.roll_number || 'N/A'}`, 14, 35);
      doc.text(`Class: ${user?.student?.class_name || 'Enrolled'} | Term: ${selectedExam === 'all' ? 'Consolidated' : selectedExam}`, 14, 42);
      doc.text(`Total: ${totalObtainedMarks}/${totalMaxMarks} (${aggregatePercentage}%) | Overall Grade: ${overallGrade}`, 14, 49);

      const tableData = filteredResults.map(r => [
        r.subject_name,
        r.exam_title || 'Term Exam',
        r.total_marks,
        r.obtained_marks,
        `${Number(r.percentage || ((r.obtained_marks / r.total_marks) * 100)).toFixed(1)}%`,
        r.grade,
        r.remarks || 'Satisfactory'
      ]);

      doc.autoTable({
        startY: 55,
        head: [['Subject', 'Exam', 'Max', 'Obtained', '%', 'Grade', 'Remarks']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] }
      });

      doc.save(`Result_${user?.username}_${selectedExam}.pdf`);
      toast.success('Transcript PDF downloaded!');
    } catch (e) {
      toast.error('Failed to generate PDF');
    }
  };

  const handleOpenWhatsApp = () => {
    setShareData({
      type: 'result',
      data: {
        student_name: user?.student?.full_name || user?.username,
        roll_number: user?.student?.roll_number || 'N/A',
        class_name: user?.student?.class_name || 'Assigned Class',
        exam_title: selectedExam === 'all' ? 'Consolidated Performance' : selectedExam,
        total_marks: totalMaxMarks,
        obtained_marks: totalObtainedMarks,
        percentage: aggregatePercentage,
        grade: overallGrade,
        subjects: filteredResults.map(r => ({
          name: r.subject_name,
          marks: `${r.obtained_marks}/${r.total_marks}`,
          grade: r.grade
        })),
        guardian_phone: user?.student?.phone || academy.phone
      }
    });
    setShareModalOpen(true);
  };

  if (loading) return <LoadingSkeleton count={3} type="card" />;

  return (
    <div className="space-y-6 animate-in fade-in">
      <PrintHeader
        title="Official Academic Transcript"
        subtitle={`Student Examination Performance Sheet • ${academy.academic_year || '2026'}`}
      />

      {/* Screen Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-7 h-7 text-indigo-600" />
            My Exam Results & Marksheets
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            View validated test scores, term assessments, final grades, and official performance certificates.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Examinations</option>
            {exams.map((ex, i) => (
              <option key={i} value={ex}>{ex}</option>
            ))}
          </select>

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

      {/* Aggregate Scorecards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Marks"
          value={`${totalObtainedMarks} / ${totalMaxMarks}`}
          icon={Award}
          color="indigo"
          subtext="Cumulative score obtained"
        />
        <StatCard
          title="Aggregate Percentage"
          value={`${aggregatePercentage}%`}
          icon={Trophy}
          color={Number(aggregatePercentage) >= 60 ? 'emerald' : 'amber'}
          subtext={Number(aggregatePercentage) >= 50 ? 'Passed & Promoted' : 'Needs Academic Improvement'}
        />
        <StatCard
          title="Assigned Grade"
          value={overallGrade}
          icon={CheckCircle2}
          color="purple"
          subtext="Standard Grading Scale"
        />
        <StatCard
          title="Evaluated Subjects"
          value={filteredResults.length}
          icon={BookOpen}
          color="teal"
          subtext="Published score entries"
        />
      </div>

      {/* Marksheet Table */}
      <div className="bg-white dark:bg-surface-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden printable-card">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Subject-wise Performance Record</h3>
            <p className="text-xs text-slate-400">Published scores verified by academic instructors</p>
          </div>
          <span className="text-xs font-mono font-bold text-brand-600 bg-brand-50 dark:bg-brand-950 px-3 py-1 rounded-full">
            {selectedExam === 'all' ? 'All Assessments' : selectedExam}
          </span>
        </div>

        {filteredResults.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No published results found for this selection.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-surface-800/60 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Exam Term</th>
                  <th className="py-3 px-4">Total Marks</th>
                  <th className="py-3 px-4">Obtained Marks</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4">Grade</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredResults.map((r, i) => {
                  const pct = r.total_marks > 0 ? ((r.obtained_marks / r.total_marks) * 100).toFixed(1) : 0;
                  return (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-surface-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {r.subject_name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {r.exam_title || 'Assessment'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-600 dark:text-slate-300">
                        {r.total_marks}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-brand-600 dark:text-brand-400 text-sm">
                        {r.obtained_marks}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {pct}%
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
                          {r.grade || calculateGrade(pct)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 italic">
                        {r.remarks || 'Commendable effort'}
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
