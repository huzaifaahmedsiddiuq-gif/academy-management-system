import React, { useEffect, useState } from 'react';
import { Bell, Plus, Edit2, Trash2, Megaphone, X, AlertCircle } from 'lucide-react';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const AnnouncementsPage = () => {
  const { role } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    content: '',
    target_role: 'all',
    target_class_id: '',
    priority: 'normal',
    is_published: true
  });

  const toast = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [aRes, cRes] = await Promise.all([
        api.get('/announcements'),
        api.get('/classes')
      ]);
      if (aRes.data?.success) setAnnouncements(aRes.data.announcements || []);
      if (cRes.data?.success) setClasses(cRes.data.classes || []);
    } catch (e) {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      title: '',
      content: '',
      target_role: 'all',
      target_class_id: '',
      priority: 'normal',
      is_published: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (a) => {
    setEditingId(a.id);
    setForm({
      title: a.title,
      content: a.content,
      target_role: a.target_role,
      target_class_id: a.target_class_id || '',
      priority: a.priority,
      is_published: a.is_published
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/announcements/${editingId}`, form);
        toast.success('Announcement updated');
      } else {
        await api.post('/announcements', form);
        toast.success('Announcement broadcasted');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to save announcement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      toast.success('Announcement deleted');
      fetchData();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Official Announcements & Notices
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Broadcast emergency alerts, holiday notices, examination dates, and reminders.
          </p>
        </div>

        {role !== 'student' && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Announcement</span>
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton count={3} type="card" />
      ) : announcements.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-surface-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-sm text-slate-700 dark:text-white">No active announcements</h3>
          <p className="text-xs text-slate-400 mt-1">Click "New Announcement" to publish circulars to students or faculty.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div
              key={a.id}
              className={`p-6 bg-white dark:bg-surface-900 rounded-3xl border shadow-sm transition-all ${
                a.priority === 'urgent'
                  ? 'border-rose-400/80 bg-rose-50/20 dark:bg-rose-950/10'
                  : a.priority === 'high'
                  ? 'border-amber-400/80 bg-amber-50/20 dark:bg-amber-950/10'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      a.priority === 'urgent'
                        ? 'bg-rose-500 text-white animate-pulse'
                        : a.priority === 'high'
                        ? 'bg-amber-500 text-white'
                        : 'bg-brand-50 text-brand-600 dark:bg-brand-950'
                    }`}
                  >
                    {a.priority} Priority
                  </span>

                  <span className="text-[11px] font-medium text-slate-400">
                    Target: <strong className="text-slate-700 dark:text-slate-300 uppercase">{a.target_role}</strong>
                    {a.class_name && ` (${a.class_name})`}
                  </span>
                </div>

                {role !== 'student' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(a)}
                      className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-3">
                {a.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap">
                {a.content}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Published on: {new Date(a.created_at).toLocaleDateString()}</span>
                <span>By: {a.creator_name || 'Admin'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">
              {editingId ? 'Edit Announcement' : 'Publish Announcement'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Circular Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Winter Vacation Dates Announced"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Audience Target *
                  </label>
                  <select
                    value={form.target_role}
                    onChange={(e) => setForm({ ...form, target_role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  >
                    <option value="all">Entire Academy (All)</option>
                    <option value="students">Students Only</option>
                    <option value="teachers">Teachers Only</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Priority Level *
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Target Specific Class (Optional)
                </label>
                <select
                  value={form.target_class_id}
                  onChange={(e) => setForm({ ...form, target_class_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                >
                  <option value="">All Classes</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.section})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Announcement Details & Notice *
                </label>
                <textarea
                  required
                  rows="4"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Type official notification body..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
