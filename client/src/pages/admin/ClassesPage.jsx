import React, { useEffect, useState } from 'react';
import { School, Plus, Edit2, Trash2, BookOpen, Users, DollarSign, X, Check } from 'lucide-react';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { useAcademy } from '../../context/AcademyContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const ClassesPage = () => {
  const [activeTab, setActiveTab] = useState('classes'); // 'classes' or 'subjects'
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [classForm, setClassForm] = useState({ name: '', section: 'A', monthly_tuition_fee: 5000, description: '' });

  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '' });

  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [selectedClassForLink, setSelectedClassForLink] = useState(null);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);

  const { academy } = useAcademy();
  const toast = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cRes, sRes] = await Promise.all([
        api.get('/classes'),
        api.get('/classes/subjects/all')
      ]);
      if (cRes.data?.success) setClasses(cRes.data.classes || []);
      if (sRes.data?.success) setSubjects(sRes.data.subjects || []);
    } catch (e) {
      toast.error('Failed to load classes and subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Class Actions
  const handleOpenAddClass = () => {
    setEditingClass(null);
    setClassForm({ name: '', section: 'A', monthly_tuition_fee: 5000, description: '' });
    setClassModalOpen(true);
  };

  const handleOpenEditClass = (c) => {
    setEditingClass(c);
    setClassForm({
      name: c.name,
      section: c.section,
      monthly_tuition_fee: c.monthly_tuition_fee,
      description: c.description || ''
    });
    setClassModalOpen(true);
  };

  const handleSaveClass = async (e) => {
    e.preventDefault();
    try {
      if (editingClass) {
        await api.put(`/classes/${editingClass.id}`, classForm);
        toast.success('Class updated');
      } else {
        await api.post('/classes', classForm);
        toast.success('Class created');
      }
      setClassModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Operation failed');
    }
  };

  const handleDeleteClass = async (id, name) => {
    if (!window.confirm(`Delete class "${name}"?`)) return;
    try {
      await api.delete(`/classes/${id}`);
      toast.success('Class removed');
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Cannot delete class with active students');
    }
  };

  // Subject Actions
  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    setSubjectForm({ name: '', code: '' });
    setSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (s) => {
    setEditingSubject(s);
    setSubjectForm({ name: s.name, code: s.code || '' });
    setSubjectModalOpen(true);
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    try {
      if (editingSubject) {
        await api.put(`/classes/subjects/${editingSubject.id}`, subjectForm);
        toast.success('Subject updated');
      } else {
        await api.post('/classes/subjects', subjectForm);
        toast.success('Subject added');
      }
      setSubjectModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Operation failed');
    }
  };

  const handleDeleteSubject = async (id, name) => {
    if (!window.confirm(`Delete subject "${name}"?`)) return;
    try {
      await api.delete(`/classes/subjects/${id}`);
      toast.success('Subject deleted');
      fetchData();
    } catch (e) {
      toast.error('Failed to delete subject');
    }
  };

  // Link Subjects to Class
  const handleOpenLinkSubjects = async (cls) => {
    try {
      setSelectedClassForLink(cls);
      const res = await api.get(`/classes/${cls.id}`);
      if (res.data?.success) {
        setSelectedSubjectIds((res.data.subjects || []).map((s) => s.id));
        setLinkModalOpen(true);
      }
    } catch (e) {
      toast.error('Could not fetch class subjects');
    }
  };

  const handleSaveLinkedSubjects = async () => {
    try {
      await api.post(`/classes/${selectedClassForLink.id}/subjects`, {
        subjectIds: selectedSubjectIds
      });
      toast.success('Curriculum updated successfully');
      setLinkModalOpen(false);
      fetchData();
    } catch (e) {
      toast.error('Failed to link subjects');
    }
  };

  const toggleSubjectSelect = (subId) => {
    if (selectedSubjectIds.includes(subId)) {
      setSelectedSubjectIds(selectedSubjectIds.filter((id) => id !== subId));
    } else {
      setSelectedSubjectIds([...selectedSubjectIds, subId]);
    }
  };

  const currency = academy.currency_symbol || 'Rs.';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Academic Grades & Subjects
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Setup classes, define monthly fee tiers, manage subjects, and configure curriculums.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-surface-800 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('classes')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'classes'
                ? 'bg-white dark:bg-surface-900 text-brand-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Classes ({classes.length})
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'subjects'
                ? 'bg-white dark:bg-surface-900 text-brand-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Subjects ({subjects.length})
          </button>
        </div>
      </div>

      {/* Tab: Classes */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={handleOpenAddClass}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Class</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="bg-white dark:bg-surface-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                        {cls.name}
                      </h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600">
                        Section {cls.section}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-brand-600">
                      <School className="w-5 h-5" />
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-3 line-clamp-2">
                    {cls.description || 'Matric/Intermediate preparation cohort'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-5 py-3 border-y border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Students</span>
                      <span className="font-extrabold text-slate-800 dark:text-white text-sm">
                        {cls.student_count || 0} enrolled
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Monthly Fee</span>
                      <span className="font-extrabold text-emerald-600 text-sm">
                        {currency} {Number(cls.monthly_tuition_fee).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between pt-2">
                  <button
                    onClick={() => handleOpenLinkSubjects(cls)}
                    className="text-xs font-bold text-brand-600 hover:text-brand-500 flex items-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Curriculum ({cls.subject_count || 0})</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditClass(cls)}
                      className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClass(cls.id, cls.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Subjects */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={handleOpenAddSubject}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subject</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {subjects.map((sub) => (
              <div
                key={sub.id}
                className="p-5 bg-white dark:bg-surface-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white">{sub.name}</h4>
                  <span className="text-[11px] font-mono text-slate-400">{sub.code || 'NO-CODE'}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditSubject(sub)}
                    className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteSubject(sub.id, sub.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Class Modal */}
      {classModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingClass ? 'Edit Class' : 'Create Class'}
              </h3>
              <button onClick={() => setClassModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Class / Grade Name *
                </label>
                <input
                  type="text"
                  required
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  placeholder="e.g. Grade 9, Grade 10"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Section / Discipline *
                </label>
                <input
                  type="text"
                  required
                  value={classForm.section}
                  onChange={(e) => setClassForm({ ...classForm, section: e.target.value })}
                  placeholder="e.g. Science - A, Pre-Engineering"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Standard Monthly Tuition Fee ({currency}) *
                </label>
                <input
                  type="number"
                  required
                  value={classForm.monthly_tuition_fee}
                  onChange={(e) => setClassForm({ ...classForm, monthly_tuition_fee: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Description / Remarks
                </label>
                <textarea
                  value={classForm.description}
                  onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setClassModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md"
                >
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Modal */}
      {subjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingSubject ? 'Edit Subject' : 'Add Subject'}
              </h3>
              <button onClick={() => setSubjectModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  placeholder="e.g. Mathematics, Sindhi Salees, Urdu"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Subject Code
                </label>
                <input
                  type="text"
                  value={subjectForm.code}
                  onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                  placeholder="e.g. MATH-09"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setSubjectModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Curriculum Link Modal */}
      {linkModalOpen && selectedClassForLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-brand-600 text-white">
              <div>
                <h3 className="font-bold text-base">Assign Curriculum Subjects</h3>
                <p className="text-xs text-brand-200">{selectedClassForLink.name} ({selectedClassForLink.section})</p>
              </div>
              <button onClick={() => setLinkModalOpen(false)} className="text-brand-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              <p className="text-xs text-slate-500">
                Select all subjects that students in this class will study:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {subjects.map((sub) => {
                  const isChecked = selectedSubjectIds.includes(sub.id);
                  return (
                    <div
                      key={sub.id}
                      onClick={() => toggleSubjectSelect(sub.id)}
                      className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all text-xs ${
                        isChecked
                          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 text-brand-900 dark:text-brand-200 font-bold'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{sub.name}</span>
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${
                          isChecked ? 'bg-brand-600 text-white' : 'border border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-surface-950 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setLinkModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLinkedSubjects}
                className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md"
              >
                Save Curriculum
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
