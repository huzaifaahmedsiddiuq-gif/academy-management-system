import React, { useEffect, useState } from 'react';
import {
  BookMarked, Plus, Search, FileText, Video, Book, Download,
  ExternalLink, Trash2, X, FolderOpen
} from 'lucide-react';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { useAcademy } from '../../context/AcademyContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const StudyMaterialPage = () => {
  const { role } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [search, setSearch] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    chapter: '',
    topic: '',
    material_type: 'pdf',
    class_id: '',
    subject_id: '',
    file_url: '',
    video_url: '',
    description: ''
  });

  const { academy } = useAcademy();
  const toast = useToast();

  const fetchDropdowns = async () => {
    try {
      const [cRes, sRes] = await Promise.all([
        api.get('/classes'),
        api.get('/classes/subjects/all')
      ]);
      if (cRes.data?.success) setClasses(cRes.data.classes || []);
      if (sRes.data?.success) setSubjects(sRes.data.subjects || []);
    } catch (e) {}
  };

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (selectedClass) query.append('classId', selectedClass);
      if (selectedSubject) query.append('subjectId', selectedSubject);
      if (search) query.append('search', search);

      const res = await api.get(`/study-materials?${query.toString()}`);
      if (res.data?.success) {
        setMaterials(res.data.materials || []);
      }
    } catch (e) {
      toast.error('Failed to load study materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [selectedClass, selectedSubject, search]);

  const handleOpenAdd = () => {
    setForm({
      title: '',
      chapter: '',
      topic: '',
      material_type: 'pdf',
      class_id: classes[0]?.id || '',
      subject_id: subjects[0]?.id || '',
      file_url: '',
      video_url: '',
      description: ''
    });
    setModalOpen(true);
  };

  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    try {
      await api.post('/study-materials', form);
      toast.success('Study material published');
      setModalOpen(false);
      fetchMaterials();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish material');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await api.delete(`/study-materials/${id}`);
      toast.success('Material removed');
      fetchMaterials();
    } catch (e) {
      toast.error('Failed to delete material');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Digital Study Material & E-Library
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organized by Class → Subject → Chapter → Topic for seamless student revision.
          </p>
        </div>

        {role !== 'student' && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Material</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-surface-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by topic, chapter, title..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.section})</option>
            ))}
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials Grid */}
      {loading ? (
        <LoadingSkeleton count={3} type="card" />
      ) : materials.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-surface-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-sm text-slate-700 dark:text-white">No materials uploaded yet</h3>
          <p className="text-xs text-slate-400 mt-1">Upload lecture notes, worksheets, past papers, or video lecture links.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {materials.map((m) => (
            <div
              key={m.id}
              className="bg-white dark:bg-surface-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-brand-50 dark:bg-brand-950 text-brand-600">
                    {m.material_type}
                  </span>
                  {role !== 'student' && (
                    <button
                      onClick={() => handleDelete(m.id, m.title)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white mt-3 leading-snug">
                  {m.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {m.class_name} • {m.subject_name}
                </p>

                {(m.chapter || m.topic) && (
                  <div className="mt-3 p-2.5 bg-slate-50 dark:bg-surface-800 rounded-xl text-xs space-y-1">
                    {m.chapter && <div><span className="text-slate-400">Chapter:</span> <strong className="text-slate-700 dark:text-slate-200">{m.chapter}</strong></div>}
                    {m.topic && <div><span className="text-slate-400">Topic:</span> <strong className="text-slate-700 dark:text-slate-200">{m.topic}</strong></div>}
                  </div>
                )}

                {m.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 line-clamp-2">
                    {m.description}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                {m.file_url ? (
                  <a
                    href={m.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-brand-600 bg-brand-50 dark:bg-brand-950/40 rounded-xl hover:bg-brand-100 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>View / Download</span>
                  </a>
                ) : m.video_url ? (
                  <a
                    href={m.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-xl hover:bg-rose-100 transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Watch Video</span>
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">No external link</span>
                )}

                <span className="text-[10px] text-slate-400">
                  {new Date(m.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">
              Upload Study Material
            </h3>

            <form onSubmit={handleSaveMaterial} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Document / Material Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Kinematics Chapter Formula Sheet & MCQs"
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

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Chapter
                  </label>
                  <input
                    type="text"
                    value={form.chapter}
                    onChange={(e) => setForm({ ...form, chapter: e.target.value })}
                    placeholder="Chapter 2"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Topic
                  </label>
                  <input
                    type="text"
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    placeholder="Vectors & Scalars"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Type
                  </label>
                  <select
                    value={form.material_type}
                    onChange={(e) => setForm({ ...form, material_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="notes">Lecture Notes</option>
                    <option value="book">E-Book</option>
                    <option value="video">Video Lecture</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  File URL or Cloud Document Link
                </label>
                <input
                  type="url"
                  value={form.file_url}
                  onChange={(e) => setForm({ ...form, file_url: e.target.value })}
                  placeholder="https://.../handout.pdf"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Short Description
                </label>
                <textarea
                  rows="2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                  Upload Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
