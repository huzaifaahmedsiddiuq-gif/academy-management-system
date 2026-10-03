import React, { useEffect, useState } from 'react';
import {
  BookOpen, Plus, Search, Calendar, FileText, CheckCircle,
  Eye, Edit2, Trash2, X, MessageSquare, Download, Clock
} from 'lucide-react';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { WhatsAppShareModal } from '../../components/WhatsAppShareModal';
import { useAcademy } from '../../context/AcademyContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const HomeworkPage = () => {
  const [homeworkList, setHomeworkList] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedClass, setSelectedClass] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);
  const [activeHomeworkSubmissions, setActiveHomeworkSubmissions] = useState([]);
  const [activeHomeworkTitle, setActiveHomeworkTitle] = useState('');

  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    class_id: '',
    subject_id: '',
    teacher_id: '',
    file_url: '',
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // WhatsApp
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState(null);

  const { academy } = useAcademy();
  const toast = useToast();

  const fetchDropdowns = async () => {
    try {
      const [cRes, sRes, tRes] = await Promise.all([
        api.get('/classes'),
        api.get('/classes/subjects/all'),
        api.get('/teachers')
      ]);
      if (cRes.data?.success) setClasses(cRes.data.classes || []);
      if (sRes.data?.success) setSubjects(sRes.data.subjects || []);
      if (tRes.data?.success) setTeachers(tRes.data.teachers || []);
    } catch (e) {}
  };

  const fetchHomework = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/homework${selectedClass ? `?classId=${selectedClass}` : ''}`);
      if (res.data?.success) {
        setHomeworkList(res.data.homework || []);
      }
    } catch (e) {
      toast.error('Failed to load homework');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchHomework();
  }, [selectedClass]);

  const handleOpenCreate = () => {
    setForm({
      title: '',
      description: '',
      class_id: classes[0]?.id || '',
      subject_id: subjects[0]?.id || '',
      teacher_id: teachers[0]?.id || '',
      file_url: '',
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setCreateModalOpen(true);
  };

  const handleSaveHomework = async (e) => {
    e.preventDefault();
    try {
      await api.post('/homework', form);
      toast.success('Homework assigned successfully and alerts sent!');
      setCreateModalOpen(false);
      fetchHomework();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create homework');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this homework assignment?')) return;
    try {
      await api.delete(`/homework/${id}`);
      toast.success('Homework deleted');
      fetchHomework();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const handleViewSubmissions = async (hw) => {
    try {
      setActiveHomeworkTitle(hw.title);
      const res = await api.get(`/homework/${hw.id}/submissions`);
      if (res.data?.success) {
        setActiveHomeworkSubmissions(res.data.submissions || []);
        setSubmissionsModalOpen(true);
      }
    } catch (e) {
      toast.error('Failed to load submissions');
    }
  };

  const handleShareHomework = (hw) => {
    const msg = `*╔════════════════════════════╗*
*   📚  ${academy.academy_name.toUpperCase()}  *
*╚════════════════════════════╝*

*━━━━━━━━ 📝 HOMEWORK ASSIGNMENT ━━━━━━━━*

🏫 *Class:* ${hw.class_name} (${hw.section})
📖 *Subject:* ${hw.subject_name}
📌 *Topic:* *${hw.title}*
📆 *Assigned Date:* ${new Date(hw.assigned_date).toLocaleDateString()}
⏰ *Due Date:* *${new Date(hw.due_date).toLocaleDateString()}*

*─── 📋 INSTRUCTIONS ───*
${hw.description || 'Please complete all exercises on clean workbook pages.'}

${hw.file_url ? `📎 *Reference Material:* ${hw.file_url}` : ''}

*──────────────────────────────*
Kindly submit on the Student Portal before the due date.`;

    setShareData({
      messageText: msg,
      targetPhone: ''
    });
    setShareModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Homework & Assignments
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Assign exercises, set due dates, review student submissions, and broadcast to WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs px-3 py-2 bg-white dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Homework</span>
          </button>
        </div>
      </div>

      {/* Homework Cards */}
      {loading ? (
        <LoadingSkeleton count={3} type="card" />
      ) : homeworkList.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-surface-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-sm text-slate-700 dark:text-white">No homework assignments found</h3>
          <p className="text-xs text-slate-400 mt-1">Click "Assign Homework" to create an assignment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {homeworkList.map((hw) => {
            const isPast = new Date(hw.due_date) < new Date();

            return (
              <div
                key={hw.id}
                className="bg-white dark:bg-surface-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600">
                      {hw.subject_name}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isPast ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {isPast ? 'Overdue' : 'Active'}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white mt-3 leading-snug">
                    {hw.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{hw.class_name} ({hw.section})</p>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 line-clamp-3 leading-relaxed">
                    {hw.description || 'No description provided.'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] flex items-center justify-between text-slate-400">
                    <span>Due: <strong className="text-slate-700 dark:text-slate-200">{new Date(hw.due_date).toLocaleDateString()}</strong></span>
                    <span>By: {hw.teacher_name}</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => handleViewSubmissions(hw)}
                    className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Submissions</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleShareHomework(hw)}
                      title="Share to WhatsApp"
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(hw.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">
              Assign Homework
            </h3>

            <form onSubmit={handleSaveHomework} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Chapter 3 Exercise 3.2 Q1 to 10"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Class *
                  </label>
                  <select
                    required
                    value={form.class_id}
                    onChange={(e) => setForm({ ...form, class_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.section})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Subject *
                  </label>
                  <select
                    required
                    value={form.subject_id}
                    onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Teacher In-charge
                  </label>
                  <select
                    value={form.teacher_id}
                    onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>{t.full_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Assignment Description & Guidelines
                </label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detail instructions, page numbers, or questions..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Optional File Link / Worksheet URL
                </label>
                <input
                  type="url"
                  value={form.file_url}
                  onChange={(e) => setForm({ ...form, file_url: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md"
                >
                  Publish Homework
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions Modal */}
      {submissionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 bg-brand-600 text-white">
              <div>
                <h3 className="font-bold text-base">Student Submissions</h3>
                <p className="text-xs text-brand-200">{activeHomeworkTitle}</p>
              </div>
              <button onClick={() => setSubmissionsModalOpen(false)} className="text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3">
              {activeHomeworkSubmissions.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-400">
                  No students have submitted solutions for this homework yet.
                </p>
              ) : (
                activeHomeworkSubmissions.map((sub) => (
                  <div key={sub.id} className="p-4 bg-slate-50 dark:bg-surface-800 rounded-2xl text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {sub.full_name} ({sub.roll_number})
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(sub.submitted_at).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                      {sub.submission_text || 'No written response.'}
                    </p>

                    {sub.file_url && (
                      <a
                        href={sub.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-brand-600 font-bold hover:underline"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>View Attached Solution</span>
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      <WhatsAppShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareData={shareData}
        title="Share Homework Assignment on WhatsApp"
      />
    </div>
  );
};
