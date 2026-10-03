import React, { useEffect, useState } from 'react';
import {
  Award, Plus, Search, Eye, Edit2, Trash2, Globe, Lock,
  Save, Printer, MessageSquare, BookOpen, CheckCircle, ChevronRight
} from 'lucide-react';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { WhatsAppShareModal } from '../../components/WhatsAppShareModal';
import { PrintHeader, PrintFooter } from '../../components/PrintHeader';
import { useAcademy } from '../../context/AcademyContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const ResultsPage = () => {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [examForm, setExamForm] = useState({ title: '', class_id: '', exam_date: '', is_published: true });

  // Marksheet view & marks entry
  const [activeExam, setActiveExam] = useState(null);
  const [marksheetData, setMarksheetData] = useState(null);
  const [subjectsList, setSubjectsList] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [marksInputMap, setMarksInputMap] = useState({}); // { student_id: obtained_marks }
  const [remarksMap, setRemarksMap] = useState({});
  const [savingMarks, setSavingMarks] = useState(false);

  // WhatsApp Share
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState(null);

  const { academy } = useAcademy();
  const toast = useToast();

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/results/exams${selectedClass ? `?classId=${selectedClass}` : ''}`);
      if (res.data?.success) {
        setExams(res.data.exams || []);
      }
    } catch (e) {
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      if (res.data?.success) setClasses(res.data.classes || []);
    } catch (e) {}
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchExams();
  }, [selectedClass]);

  const handleOpenAddExam = () => {
    setEditingExam(null);
    setExamForm({
      title: '',
      class_id: classes[0]?.id || '',
      exam_date: new Date().toISOString().split('T')[0],
      is_published: true
    });
    setExamModalOpen(true);
  };

  const handleSaveExam = async (e) => {
    e.preventDefault();
    try {
      if (editingExam) {
        await api.put(`/results/exams/${editingExam.id}`, examForm);
        toast.success('Exam updated');
      } else {
        await api.post('/results/exams', examForm);
        toast.success('Exam created');
      }
      setExamModalOpen(false);
      fetchExams();
    } catch (err) {
      toast.error('Failed to save exam');
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      const res = await api.patch(`/results/exams/${id}/toggle-publish`);
      toast.success(res.data.is_published ? 'Results published to students' : 'Results unpublished');
      fetchExams();
    } catch (e) {
      toast.error('Failed to toggle publish state');
    }
  };

  const handleDeleteExam = async (id, title) => {
    if (!window.confirm(`Delete exam "${title}" and all marks?`)) return;
    try {
      await api.delete(`/results/exams/${id}`);
      toast.success('Exam deleted');
      if (activeExam?.id === id) setActiveExam(null);
      fetchExams();
    } catch (e) {
      toast.error('Failed to delete exam');
    }
  };

  // Open marksheet
  const handleOpenMarksheet = async (exam) => {
    setActiveExam(exam);
    try {
      // Get class subjects
      const classRes = await api.get(`/classes/${exam.class_id}`);
      const subs = classRes.data?.subjects || [];
      setSubjectsList(subs);
      const defaultSubId = subs[0]?.id || '';
      setSelectedSubjectId(defaultSubId);

      // Get existing marks
      const mRes = await api.get(`/results/exams/${exam.id}/marksheet`);
      if (mRes.data?.success) {
        setMarksheetData(mRes.data);
        syncInputMaps(mRes.data, defaultSubId);
      }
    } catch (e) {
      toast.error('Failed to load marksheet');
    }
  };

  const syncInputMaps = (sheet, subjectId) => {
    const marksMap = {};
    const remMap = {};
    const relevantResults = (sheet.results || []).filter(
      (r) => !subjectId || r.subject_id === parseInt(subjectId, 10)
    );
    for (const r of relevantResults) {
      marksMap[r.student_id] = r.obtained_marks;
      remMap[r.student_id] = r.remarks || '';
    }
    setMarksInputMap(marksMap);
    setRemarksMap(remMap);
  };

  const handleSubjectChange = (newSubId) => {
    setSelectedSubjectId(newSubId);
    if (marksheetData) syncInputMaps(marksheetData, newSubId);
  };

  const handleSaveMarks = async () => {
    if (!activeExam || !selectedSubjectId) {
      toast.warning('Please select a subject first.');
      return;
    }
    setSavingMarks(true);
    try {
      const records = (marksheetData?.students || []).map((s) => ({
        student_id: s.student_id,
        subject_id: parseInt(selectedSubjectId, 10),
        total_marks: 100,
        obtained_marks: marksInputMap[s.student_id] !== undefined ? marksInputMap[s.student_id] : '',
        remarks: remarksMap[s.student_id] || ''
      }));

      await api.post(`/results/exams/${activeExam.id}/marks`, { marks: records });
      toast.success('Marks updated successfully!');

      // Refresh marksheet
      const mRes = await api.get(`/results/exams/${activeExam.id}/marksheet`);
      if (mRes.data?.success) {
        setMarksheetData(mRes.data);
        syncInputMaps(mRes.data, selectedSubjectId);
      }
    } catch (e) {
      toast.error('Failed to save marks');
    } finally {
      setSavingMarks(false);
    }
  };

  const handleWhatsAppResult = async (examId, studentId) => {
    try {
      const res = await api.get(`/whatsapp/result/${examId}/${studentId}`);
      if (res.data?.success) {
        setShareData(res.data);
        setShareModalOpen(true);
      }
    } catch (e) {
      toast.error('Failed to format WhatsApp result card');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Examinations & Results Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Conduct terms, record subject marks, calculate auto-percentages, and share report cards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddExam}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Examination</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Exams List & Marksheet Entry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Exams Directory */}
        <div className="lg:col-span-1 space-y-3 no-print">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Examinations ({exams.length})
            </span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="text-xs px-2 py-1 bg-white dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <LoadingSkeleton count={3} type="card" />
          ) : (
            <div className="space-y-3">
              {exams.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-surface-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  No exams created yet.
                </div>
              ) : (
                exams.map((ex) => (
                  <div
                    key={ex.id}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      activeExam?.id === ex.id
                        ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/20 shadow-sm'
                        : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-surface-900 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div onClick={() => handleOpenMarksheet(ex)} className="flex-1">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                          {ex.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          {ex.class_name} ({ex.section}) | {new Date(ex.exam_date).toLocaleDateString()}
                        </p>
                      </div>

                      <button
                        onClick={() => handleTogglePublish(ex.id)}
                        title={ex.is_published ? 'Published (Click to Unpublish)' : 'Unpublished (Click to Publish)'}
                        className={`p-1.5 rounded-lg text-xs transition-colors ${
                          ex.is_published
                            ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                            : 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                        }`}
                      >
                        {ex.is_published ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      <button
                        onClick={() => handleOpenMarksheet(ex)}
                        className="font-bold text-brand-600 hover:underline flex items-center gap-1"
                      >
                        <span>Open Marksheet</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteExam(ex.id, ex.title)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right: Active Marksheet Entry & Report Card Generation */}
        <div className="lg:col-span-2">
          {!activeExam ? (
            <div className="p-12 text-center bg-white dark:bg-surface-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center">
              <Award className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Select an Examination</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Choose an exam from the list on the left to enter student marks, calculate grades, or generate official report cards.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-surface-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden printable-card">
              {/* Header inside marksheet */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {activeExam.title} - Marksheet
                  </h3>
                  <p className="text-xs text-slate-400">Class: {activeExam.class_name} ({activeExam.section})</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-brand-600"
                  >
                    {subjectsList.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>

                  <button
                    onClick={handleSaveMarks}
                    disabled={savingMarks}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md transition-all disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingMarks ? 'Saving...' : 'Save Marks'}</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 dark:hover:bg-surface-800 rounded-xl"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Print Document Header */}
              <PrintHeader
                title={`EXAMINATION MARKSHEET - ${activeExam.title}`}
                documentNumber={`EX-${activeExam.id}`}
              />

              {/* Table */}
              <div className="overflow-x-auto p-2">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-surface-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Roll No</th>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3 text-center">Total Marks</th>
                      <th className="px-4 py-3 text-center">Obtained Marks</th>
                      <th className="px-4 py-3 text-center">Grade</th>
                      <th className="px-4 py-3 text-right no-print">WhatsApp Card</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(!marksheetData?.students || marksheetData.students.length === 0) ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-slate-400">
                          No students enrolled in this class.
                        </td>
                      </tr>
                    ) : (
                      marksheetData.students.map((s) => {
                        const marks = marksInputMap[s.student_id] !== undefined ? marksInputMap[s.student_id] : '';
                        const num = Number(marks);
                        const grade = marks !== '' ? (num >= 90 ? 'A+' : num >= 80 ? 'A' : num >= 70 ? 'B' : num >= 60 ? 'C' : num >= 50 ? 'D' : 'F') : '-';

                        return (
                          <tr key={s.student_id} className="hover:bg-slate-50/50 dark:hover:bg-surface-800/40">
                            <td className="px-4 py-3 font-mono font-bold text-slate-800 dark:text-white">
                              {s.roll_number}
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                              {s.full_name}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-slate-500">100</td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={marks}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setMarksInputMap((prev) => ({ ...prev, [s.student_id]: val }));
                                }}
                                placeholder="0-100"
                                className="w-20 px-2 py-1 text-center bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                              />
                            </td>
                            <td className="px-4 py-3 text-center font-bold">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] ${
                                  grade === 'A+' || grade === 'A'
                                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600'
                                    : grade === 'B' || grade === 'C'
                                    ? 'bg-blue-50 dark:bg-blue-950 text-blue-600'
                                    : 'bg-rose-50 dark:bg-rose-950 text-rose-600'
                                }`}
                              >
                                {grade}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right no-print">
                              <button
                                onClick={() => handleWhatsAppResult(activeExam.id, s.student_id)}
                                title="Share Rich Result Card via WhatsApp"
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 rounded-lg transition-colors"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Share</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <PrintFooter />
            </div>
          )}
        </div>
      </div>

      {/* Examination Modal */}
      {examModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in no-print">
          <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">
              Schedule New Examination
            </h3>

            <form onSubmit={handleSaveExam} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Exam Title *
                </label>
                <input
                  type="text"
                  required
                  value={examForm.title}
                  onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                  placeholder="e.g. Mid-Term Evaluation 2025, First Term"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Target Class *
                </label>
                <select
                  required
                  value={examForm.class_id}
                  onChange={(e) => setExamForm({ ...examForm, class_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.section})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Examination Date
                </label>
                <input
                  type="date"
                  value={examForm.exam_date}
                  onChange={(e) => setExamForm({ ...examForm, exam_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pub"
                  checked={examForm.is_published}
                  onChange={(e) => setExamForm({ ...examForm, is_published: e.target.checked })}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <label htmlFor="pub" className="font-semibold text-slate-700 dark:text-slate-300">
                  Publish results immediately to students
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setExamModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md"
                >
                  Create Examination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Share Modal */}
      <WhatsAppShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareData={shareData}
        title="Share Result Card on WhatsApp"
      />
    </div>
  );
};
