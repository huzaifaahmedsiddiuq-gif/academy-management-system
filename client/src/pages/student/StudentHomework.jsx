import React, { useEffect, useState } from 'react';
import { BookOpen, Calendar, Clock, CheckCircle2, AlertCircle, Download, Send, FileText, X, MessageSquare, ExternalLink } from 'lucide-react';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { WhatsAppShareModal } from '../../components/WhatsAppShareModal';
import { StatCard } from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import { useAcademy } from '../../context/AcademyContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const StudentHomework = () => {
  const { user } = useAuth();
  const { academy } = useAcademy();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [homeworkList, setHomeworkList] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'submitted'

  // Submission Modal
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedHw, setSelectedHw] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // WhatsApp
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState(null);

  const fetchHomework = async () => {
    try {
      setLoading(true);
      const res = await api.get('/homework');
      if (res.data?.success) {
        setHomeworkList(res.data.homework || []);
      }
    } catch (e) {
      toast.error('Failed to load homework assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomework();
  }, []);

  const handleOpenSubmit = (hw) => {
    setSelectedHw(hw);
    setSubmissionText('');
    setSubmissionFile('');
    setSubmitModalOpen(true);
  };

  const handleSubmitHomework = async (e) => {
    e.preventDefault();
    if (!submissionText.trim() && !submissionFile.trim()) {
      toast.warning('Please provide your solution notes or attachment link');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post(`/homework/${selectedHw.id}/submit`, {
        notes: submissionText,
        file_url: submissionFile
      });
      if (res.data?.success) {
        toast.success('Homework submitted successfully!');
        setSubmitModalOpen(false);
        fetchHomework();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenWhatsApp = (hw) => {
    setShareData({
      type: 'homework',
      data: {
        title: hw.title,
        subject: hw.subject_name || 'Assigned Subject',
        due_date: new Date(hw.due_date).toLocaleDateString(),
        description: hw.description,
        class_name: hw.class_name || 'Enrolled Class'
      }
    });
    setShareModalOpen(true);
  };

  if (loading) return <LoadingSkeleton count={3} type="card" />;

  const isOverdue = (dateStr) => new Date(dateStr) < new Date();

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-purple-600" />
            Class Homework & Assignments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review tasks assigned by faculty, upload your submissions, and verify evaluation remarks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              filter === 'all'
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                : 'bg-white dark:bg-surface-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            All ({homeworkList.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              filter === 'active'
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                : 'bg-white dark:bg-surface-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Due Soon
          </button>
        </div>
      </div>

      {/* Homework List Cards */}
      {homeworkList.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-surface-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800 dark:text-white">All Clear! No Homework Due</h3>
          <p className="text-xs text-slate-400 mt-1">You have reviewed all active coursework tasks.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {homeworkList.map((hw) => {
            const due = new Date(hw.due_date);
            const overdue = isOverdue(hw.due_date);

            return (
              <div
                key={hw.id}
                className="p-6 bg-white dark:bg-surface-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                      {hw.subject_name || 'Subject Course'}
                    </span>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        overdue
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      Due {due.toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {hw.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4 line-clamp-3">
                    {hw.description || 'No specific instructions provided.'}
                  </p>

                  {hw.file_url && (
                    <div className="mb-4">
                      <a
                        href={hw.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-brand-600 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Download Attached Reference File
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenSubmit(hw)}
                    className="flex-1 py-2 px-3 text-center text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit Solution
                  </button>

                  <button
                    onClick={() => handleOpenWhatsApp(hw)}
                    title="Share details via WhatsApp"
                    className="p-2 text-slate-500 hover:text-emerald-600 bg-slate-50 dark:bg-surface-800 hover:bg-emerald-50 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      {submitModalOpen && selectedHw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-surface-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Submit Solution: {selectedHw.title}
                </h3>
                <p className="text-xs text-slate-400">Class: {selectedHw.subject_name}</p>
              </div>
              <button
                onClick={() => setSubmitModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitHomework} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Answer / Notes / Summary *
                </label>
                <textarea
                  rows="4"
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Type your homework answer or description of your completed work..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Attachment Link / File URL (Optional)
                </label>
                <input
                  type="url"
                  value={submissionFile}
                  onChange={(e) => setSubmissionFile(e.target.value)}
                  placeholder="https://drive.google.com/... or cloud document link"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSubmitModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-surface-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md shadow-brand-500/20 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Confirm Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
