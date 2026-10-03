import React, { useEffect, useState } from 'react';
import { User, Lock, Mail, Phone, MapPin, Calendar, School, ShieldCheck, Printer, Download, MessageSquare, CheckCircle } from 'lucide-react';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { PrintHeader, PrintFooter } from '../../components/PrintHeader';
import { WhatsAppShareModal } from '../../components/WhatsAppShareModal';
import { useAuth } from '../../context/AuthContext';
import { useAcademy } from '../../context/AcademyContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const StudentProfile = () => {
  const { user } = useAuth();
  const { academy } = useAcademy();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  // Change Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  // WhatsApp
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState(null);

  const studentId = user?.studentId || user?.student?.id;

  const fetchProfile = async () => {
    if (!studentId) return;
    try {
      setLoading(true);
      const res = await api.get(`/students/${studentId}`);
      if (res.data?.success) {
        setProfileData(res.data);
      }
    } catch (e) {
      toast.error('Failed to load student profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [studentId]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.warning('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }

    try {
      setChangingPass(true);
      const res = await api.post('/auth/change-password', {
        currentPassword: oldPassword,
        newPassword
      });
      if (res.data?.success) {
        toast.success('Password changed successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPass(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const student = profileData?.student || user?.student || {};
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(academy.academy_name, 14, 20);
      doc.setFontSize(12);
      doc.text('OFFICIAL STUDENT RECORD PROFILE', 14, 28);
      doc.text(`Academic Session: ${academy.academic_year || '2025-2026'}`, 14, 35);

      const tableData = [
        ['Full Name', student.full_name || user?.username],
        ['Father / Guardian', student.father_name || 'N/A'],
        ['Roll Number', student.roll_number || 'N/A'],
        ['Assigned Class', `${student.class_name || 'Class'} (${student.section || 'A'})`],
        ['Contact Phone', student.phone || 'N/A'],
        ['Email Address', student.email || user?.email || 'N/A'],
        ['Residential Address', student.address || 'N/A'],
        ['Date of Birth', student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'],
        ['Admission Date', student.admission_date ? new Date(student.admission_date).toLocaleDateString() : 'N/A'],
        ['Status', (student.status || 'Active').toUpperCase()]
      ];

      doc.autoTable({
        startY: 42,
        head: [['Field', 'Student Particulars']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] }
      });

      doc.save(`Profile_${student.roll_number || user?.username}.pdf`);
      toast.success('Profile PDF downloaded!');
    } catch (e) {
      toast.error('Failed to generate PDF');
    }
  };

  const handleOpenWhatsApp = () => {
    const student = profileData?.student || user?.student || {};
    setShareData({
      type: 'student_profile',
      data: {
        student_name: student.full_name || user?.username,
        roll_number: student.roll_number || 'N/A',
        father_name: student.father_name || 'N/A',
        class_name: `${student.class_name || 'Grade'} (${student.section || 'A'})`,
        phone: student.phone || academy.phone,
        status: student.status || 'Active',
        guardian_phone: student.phone || academy.phone
      }
    });
    setShareModalOpen(true);
  };

  if (loading) return <LoadingSkeleton count={3} type="card" />;

  const student = profileData?.student || user?.student || {};

  return (
    <div className="space-y-6 animate-in fade-in">
      <PrintHeader
        title="Official Student Profile Document"
        subtitle={`Academy Identification & Enrollment Dossier • ${academy.academic_year || '2025-2026'}`}
      />

      {/* Screen Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-7 h-7 text-brand-600" />
            My Student Profile
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Personal enrollment record, registration credentials, and security management.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Profile
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            PDF Dossier
          </button>
          <button
            onClick={handleOpenWhatsApp}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md shadow-emerald-600/20"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Share Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card & Particulars */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-surface-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 shadow-sm printable-card">
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-3xl shadow-lg shadow-brand-500/30">
                {student.full_name?.slice(0, 2) || 'ST'}
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="px-3 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-mono text-xs font-bold">
                    Roll: {student.roll_number || 'N/A'}
                  </span>
                  <span className="px-3 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    {student.status || 'Active'}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">
                  {student.full_name || user?.username}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Class: {student.class_name || 'General Batch'} • Section: {student.section || 'A'}
                </p>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-surface-800/60 rounded-2xl">
                <span className="text-slate-400 block mb-1">Father / Guardian Name</span>
                <span className="font-bold text-slate-800 dark:text-white text-sm">{student.father_name || 'N/A'}</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-surface-800/60 rounded-2xl">
                <span className="text-slate-400 block mb-1">Contact Phone</span>
                <span className="font-bold text-slate-800 dark:text-white text-sm">{student.phone || 'N/A'}</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-surface-800/60 rounded-2xl">
                <span className="text-slate-400 block mb-1">Email Address</span>
                <span className="font-bold text-slate-800 dark:text-white text-sm">{student.email || user?.email || 'N/A'}</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-surface-800/60 rounded-2xl">
                <span className="text-slate-400 block mb-1">Residential Address</span>
                <span className="font-bold text-slate-800 dark:text-white text-sm">{student.address || 'N/A'}</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-surface-800/60 rounded-2xl">
                <span className="text-slate-400 block mb-1">Date of Birth</span>
                <span className="font-bold text-slate-800 dark:text-white text-sm">
                  {student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-surface-800/60 rounded-2xl">
                <span className="text-slate-400 block mb-1">Admission Date</span>
                <span className="font-bold text-slate-800 dark:text-white text-sm">
                  {student.admission_date ? new Date(student.admission_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="space-y-6 no-print">
          <div className="bg-white dark:bg-surface-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-brand-600" />
              Change Password
            </h3>
            <p className="text-xs text-slate-400 mb-5">Keep your student portal account safe and secure.</p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={changingPass}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md shadow-brand-500/25 transition-all disabled:opacity-50"
              >
                {changingPass ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
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
