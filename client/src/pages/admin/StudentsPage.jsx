import React, { useEffect, useState } from 'react';
import {
  Users, Plus, Search, Filter, Eye, Edit2, Trash2, KeyRound,
  CheckCircle2, XCircle, Phone, Mail, MapPin, Calendar, BookOpen,
  CreditCard, Award, X, MessageSquare, Download, Printer
} from 'lucide-react';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { WhatsAppShareModal } from '../../components/WhatsAppShareModal';
import { PrintHeader, PrintFooter } from '../../components/PrintHeader';
import { useAcademy } from '../../context/AcademyContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    father_name: '',
    roll_number: '',
    phone: '',
    guardian_phone: '',
    address: '',
    date_of_birth: '',
    admission_date: new Date().toISOString().split('T')[0],
    class_id: '',
    section: 'A'
  });

  const { academy } = useAcademy();
  const toast = useToast();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (selectedClass) query.append('classId', selectedClass);
      if (selectedStatus) query.append('status', selectedStatus);

      const res = await api.get(`/students?${query.toString()}`);
      if (res.data?.success) {
        setStudents(res.data.students || []);
      }
    } catch (err) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      if (res.data?.success) {
        setClasses(res.data.classes || []);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [search, selectedClass, selectedStatus]);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      full_name: '',
      father_name: '',
      roll_number: `APEX-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      phone: '',
      guardian_phone: '',
      address: '',
      date_of_birth: '',
      admission_date: new Date().toISOString().split('T')[0],
      class_id: classes[0]?.id || '',
      section: 'A'
    });
    setFormModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      username: student.username || '',
      email: student.email || student.user_email || '',
      password: '', // Leave blank unless changing
      full_name: student.full_name,
      father_name: student.father_name || '',
      roll_number: student.roll_number,
      phone: student.phone || '',
      guardian_phone: student.guardian_phone || '',
      address: student.address || '',
      date_of_birth: student.date_of_birth ? student.date_of_birth.split('T')[0] : '',
      admission_date: student.admission_date ? student.admission_date.split('T')[0] : '',
      class_id: student.class_id,
      section: student.section || 'A'
    });
    setFormModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await api.put(`/students/${editingStudent.id}`, formData);
        toast.success('Student updated successfully');
      } else {
        await api.post('/students', formData);
        toast.success('Student enrolled successfully');
      }
      setFormModalOpen(false);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove student "${name}"?`)) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student removed');
      fetchStudents();
    } catch (err) {
      toast.error('Failed to remove student');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.patch(`/students/${id}/toggle-status`);
      toast.success(`Student status updated to ${res.data.status}`);
      fetchStudents();
    } catch (err) {
      toast.error('Status update failed');
    }
  };

  const handleViewProfile = async (id) => {
    try {
      const res = await api.get(`/students/${id}`);
      if (res.data?.success) {
        setSelectedProfile(res.data);
        setProfileModalOpen(true);
      }
    } catch (err) {
      toast.error('Failed to fetch student details');
    }
  };

  const handleWhatsAppStudent = async (studentId) => {
    try {
      const res = await api.get(`/whatsapp/attendance/${studentId}`);
      if (res.data?.success) {
        setShareData(res.data);
        setShareModalOpen(true);
      }
    } catch (err) {
      toast.error('Could not generate WhatsApp report');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Student Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage student enrollments, profiles, credentials, and academic track records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print List</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-surface-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between no-print">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, roll number, or phone..."
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
              <option key={c.id} value={c.id}>
                {c.name} ({c.section})
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Print Document Letterhead Header */}
      <PrintHeader title="STUDENT ENROLLMENT DIRECTORY" />

      {/* Students Data Table */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden printable-card">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton type="table" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-surface-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Roll No</th>
                  <th className="px-5 py-3.5">Student Details</th>
                  <th className="px-5 py-3.5">Class / Section</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-10 text-center text-slate-400">
                      No students found matching current filters.
                    </td>
                  </tr>
                ) : (
                  students.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-surface-800/40 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                        {s.roll_number}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{s.full_name}</div>
                        <div className="text-[11px] text-slate-400">S/O {s.father_name || 'N/A'}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{s.class_name}</span>
                        <span className="text-[11px] text-slate-400 block">Sec: {s.section}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-slate-700 dark:text-slate-300 font-medium">{s.phone || 'N/A'}</div>
                        <div className="text-[10px] text-slate-400">{s.email}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleToggleStatus(s.id)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            s.status === 'active'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600'
                          }`}
                        >
                          {s.status}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right no-print">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleViewProfile(s.id)}
                            title="View Complete 360 Profile"
                            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-surface-800 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleWhatsAppStudent(s.id)}
                            title="Share on WhatsApp"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-surface-800 rounded-lg transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(s)}
                            title="Edit Student"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-surface-800 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id, s.full_name)}
                            title="Delete Student"
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

      <PrintFooter />

      {/* Add / Edit Student Modal */}
      {formModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in no-print">
          <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 bg-brand-600 text-white">
              <h3 className="font-bold text-base">
                {editingStudent ? 'Edit Student Details' : 'New Student Admission'}
              </h3>
              <button onClick={() => setFormModalOpen(false)} className="text-brand-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
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
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Father / Guardian Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.father_name}
                    onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.roll_number}
                    onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Class & Section *
                  </label>
                  <select
                    required
                    value={formData.class_id}
                    onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.section})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Student Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+92 312 0000000"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Guardian Phone (for Receipts/WhatsApp)
                  </label>
                  <input
                    type="text"
                    value={formData.guardian_phone}
                    onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                    placeholder="+92 300 0000000"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address, city"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              {!editingStudent && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Portal Login Username *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="e.g. s_ahmed"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Initial Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
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
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md"
                >
                  {editingStudent ? 'Save Changes' : 'Complete Admission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student 360 Profile Modal */}
      {profileModalOpen && selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in no-print">
          <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-brand-900 to-indigo-950 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-sm">
                  {selectedProfile.student.full_name?.slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-extrabold text-base">{selectedProfile.student.full_name}</h3>
                  <p className="text-xs text-brand-300">
                    Roll: {selectedProfile.student.roll_number} | Class: {selectedProfile.student.class_name}
                  </p>
                </div>
              </div>
              <button onClick={() => setProfileModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Quick Stat Pill Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-50 dark:bg-surface-800 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Attendance</span>
                  <p className="text-lg font-extrabold text-emerald-600 mt-0.5">
                    {selectedProfile.attendance.percentage}%
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-surface-800 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Days Present</span>
                  <p className="text-lg font-extrabold text-slate-800 dark:text-white mt-0.5">
                    {selectedProfile.attendance.present} / {selectedProfile.attendance.total}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-surface-800 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Total Exams</span>
                  <p className="text-lg font-extrabold text-indigo-600 mt-0.5">
                    {selectedProfile.results.length}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-surface-800 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Fee Invoices</span>
                  <p className="text-lg font-extrabold text-amber-600 mt-0.5">
                    {selectedProfile.fees.length}
                  </p>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Personal Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-surface-800/60 p-4 rounded-2xl">
                  <div><span className="text-slate-400">Father's Name:</span> <span className="font-semibold text-slate-800 dark:text-white">{selectedProfile.student.father_name}</span></div>
                  <div><span className="text-slate-400">Phone:</span> <span className="font-semibold text-slate-800 dark:text-white">{selectedProfile.student.phone || 'N/A'}</span></div>
                  <div><span className="text-slate-400">Guardian Contact:</span> <span className="font-semibold text-slate-800 dark:text-white">{selectedProfile.student.guardian_phone || 'N/A'}</span></div>
                  <div><span className="text-slate-400">Email:</span> <span className="font-semibold text-slate-800 dark:text-white">{selectedProfile.student.email}</span></div>
                  <div className="sm:col-span-2"><span className="text-slate-400">Address:</span> <span className="font-semibold text-slate-800 dark:text-white">{selectedProfile.student.address || 'N/A'}</span></div>
                </div>
              </div>

              {/* Recent Results */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Examination Results</h4>
                {selectedProfile.results.length === 0 ? (
                  <p className="text-xs text-slate-400">No published exam results yet.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedProfile.results.map((r) => (
                      <div key={r.id} className="p-3 bg-slate-50 dark:bg-surface-800 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">{r.subject_name}</p>
                          <p className="text-[11px] text-slate-400">{r.exam_title}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-brand-600">{r.obtained_marks} / {r.total_marks}</span>
                          <span className="ml-2 font-bold px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-600">
                            {r.grade}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-surface-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setProfileModalOpen(false)}
                className="px-4 py-2 text-xs font-bold bg-slate-800 text-white rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      <WhatsAppShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareData={shareData}
        title="Share Student Report via WhatsApp"
      />
    </div>
  );
};
