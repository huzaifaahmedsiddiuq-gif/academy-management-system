import React, { useEffect, useState } from 'react';
import {
  GraduationCap, Plus, Search, Edit2, Trash2, BookOpen, School,
  Phone, Mail, Check, X, Shield, Award
} from 'lucide-react';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { useAcademy } from '../../context/AcademyContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const TeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTeacherForAssign, setSelectedTeacherForAssign] = useState(null);
  const [teacherAssignments, setTeacherAssignments] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    phone: '',
    qualification: '',
    specialization: '',
    salary: 50000,
    joining_date: new Date().toISOString().split('T')[0]
  });

  const { academy } = useAcademy();
  const toast = useToast();

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teachers');
      if (res.data?.success) {
        setTeachers(res.data.teachers || []);
      }
    } catch (e) {
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassesAndSubjects = async () => {
    try {
      const [cRes, sRes] = await Promise.all([
        api.get('/classes'),
        api.get('/classes/subjects/all')
      ]);
      if (cRes.data?.success) setClasses(cRes.data.classes || []);
      if (sRes.data?.success) setSubjects(sRes.data.subjects || []);
    } catch (e) {}
  };

  useEffect(() => {
    fetchTeachers();
    fetchClassesAndSubjects();
  }, []);

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      full_name: '',
      phone: '',
      qualification: '',
      specialization: '',
      salary: 50000,
      joining_date: new Date().toISOString().split('T')[0]
    });
    setFormModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTeacher(t);
    setFormData({
      username: t.username || '',
      email: t.email || t.user_email || '',
      password: '',
      full_name: t.full_name,
      phone: t.phone || '',
      qualification: t.qualification || '',
      specialization: t.specialization || '',
      salary: t.salary || 0,
      joining_date: t.joining_date ? t.joining_date.split('T')[0] : ''
    });
    setFormModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        await api.put(`/teachers/${editingTeacher.id}`, formData);
        toast.success('Teacher profile updated');
      } else {
        await api.post('/teachers', formData);
        toast.success('Teacher registered successfully');
      }
      setFormModalOpen(false);
      fetchTeachers();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove teacher "${name}"?`)) return;
    try {
      await api.delete(`/teachers/${id}`);
      toast.success('Teacher removed');
      fetchTeachers();
    } catch (e) {
      toast.error('Failed to remove teacher');
    }
  };

  const handleOpenAssign = async (teacher) => {
    try {
      setSelectedTeacherForAssign(teacher);
      const res = await api.get(`/teachers/${teacher.id}`);
      if (res.data?.success) {
        setTeacherAssignments(
          (res.data.assignments || []).map((a) => ({ class_id: a.class_id, subject_id: a.subject_id }))
        );
        setAssignModalOpen(true);
      }
    } catch (e) {
      toast.error('Failed to load assignments');
    }
  };

  const handleAddAssignmentRow = () => {
    if (classes.length > 0 && subjects.length > 0) {
      setTeacherAssignments([
        ...teacherAssignments,
        { class_id: classes[0].id, subject_id: subjects[0].id }
      ]);
    }
  };

  const handleRemoveAssignmentRow = (index) => {
    setTeacherAssignments(teacherAssignments.filter((_, i) => i !== index));
  };

  const handleSaveAssignments = async () => {
    try {
      await api.post(`/teachers/${selectedTeacherForAssign.id}/assignments`, {
        assignments: teacherAssignments
      });
      toast.success('Class and subject assignments saved');
      setAssignModalOpen(false);
      fetchTeachers();
    } catch (e) {
      toast.error('Failed to save assignments');
    }
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.specialization?.toLowerCase().includes(search.toLowerCase()) ||
      t.phone?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Faculty & Teacher Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Assign courses, classes, manage credentials, and monitor faculty allocation.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Teacher</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white dark:bg-surface-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by faculty name or specialization..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Faculty Cards / Table */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton type="table" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-surface-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Faculty Member</th>
                  <th className="px-5 py-3.5">Specialization</th>
                  <th className="px-5 py-3.5">Assigned Classes</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-10 text-center text-slate-400">
                      No teachers found.
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-surface-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 font-bold text-xs flex items-center justify-center">
                            {t.full_name?.slice(0, 2) || 'TC'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{t.full_name}</div>
                            <div className="text-[11px] text-slate-400">{t.qualification || 'Educator'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{t.specialization || 'General'}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-brand-600 px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950">
                          {t.assigned_classes_count || 0} classes
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-slate-700 dark:text-slate-300 font-medium">{t.phone || 'N/A'}</div>
                        <div className="text-[10px] text-slate-400">{t.email}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                          {t.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenAssign(t)}
                            title="Assign Classes & Subjects"
                            className="p-1.5 text-brand-600 hover:bg-brand-50 dark:hover:bg-surface-800 rounded-lg transition-colors flex items-center gap-1 font-semibold text-[11px]"
                          >
                            <School className="w-3.5 h-3.5" />
                            <span>Assign</span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(t)}
                            title="Edit"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-surface-800 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id, t.full_name)}
                            title="Delete"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-surface-800 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Teacher Modal */}
      {formModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-emerald-600 text-white">
              <h3 className="font-bold text-base">
                {editingTeacher ? 'Edit Teacher Details' : 'Register New Faculty Member'}
              </h3>
              <button onClick={() => setFormModalOpen(false)} className="text-emerald-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Qualification
                  </label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="e.g. M.Sc. Mathematics"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="e.g. Physics & Calculus"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Monthly Salary ({academy.currency_symbol || 'Rs.'})
                  </label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {!editingTeacher && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Login Username *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="e.g. t_rashid"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-surface-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md"
                >
                  {editingTeacher ? 'Save Changes' : 'Register Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Classes Modal */}
      {assignModalOpen && selectedTeacherForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-brand-600 text-white">
              <div>
                <h3 className="font-bold text-base">Assign Classes & Subjects</h3>
                <p className="text-xs text-brand-200">{selectedTeacherForAssign.full_name}</p>
              </div>
              <button onClick={() => setAssignModalOpen(false)} className="text-brand-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Active Assignments ({teacherAssignments.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddAssignmentRow}
                  className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Assignment
                </button>
              </div>

              {teacherAssignments.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-400">
                  No courses assigned yet. Click "Add Assignment" to assign a class and subject.
                </p>
              ) : (
                <div className="space-y-3">
                  {teacherAssignments.map((row, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-surface-800 rounded-2xl border border-slate-200 dark:border-slate-700"
                    >
                      <select
                        value={row.class_id}
                        onChange={(e) => {
                          const updated = [...teacherAssignments];
                          updated[index].class_id = parseInt(e.target.value, 10);
                          setTeacherAssignments(updated);
                        }}
                        className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                      >
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>{c.name} ({c.section})</option>
                        ))}
                      </select>

                      <select
                        value={row.subject_id}
                        onChange={(e) => {
                          const updated = [...teacherAssignments];
                          updated[index].subject_id = parseInt(e.target.value, 10);
                          setTeacherAssignments(updated);
                        }}
                        className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                      >
                        {subjects.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveAssignmentRow(index)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-surface-950 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setAssignModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAssignments}
                className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md"
              >
                Save Assignments
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
