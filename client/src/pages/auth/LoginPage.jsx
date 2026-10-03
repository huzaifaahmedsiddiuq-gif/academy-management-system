import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, Lock, User, ArrowRight, ShieldCheck, GraduationCap, UserCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAcademy } from '../../context/AcademyContext';
import { useToast } from '../../context/ToastContext';

export const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeRoleLoading, setActiveRoleLoading] = useState(null); // 'admin' | 'teacher' | 'student' | 'form'
  const { login } = useAuth();
  const { academy } = useAcademy();
  const toast = useToast();
  const navigate = useNavigate();

  const handlePerformLogin = async (userIdentifier, userPassword, roleType = 'form') => {
    if (!userIdentifier || !userPassword) {
      toast.warning('Please enter username and password');
      return;
    }

    setLoading(true);
    setActiveRoleLoading(roleType);

    try {
      const user = await login(userIdentifier, userPassword);
      toast.success(`Welcome back, ${user.username}!`);

      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'teacher') navigate('/teacher/dashboard');
      else if (user.role === 'student') navigate('/student/dashboard');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
      setActiveRoleLoading(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handlePerformLogin(identifier, password, 'form');
  };

  const handleDirectLogin = (idVal, passVal, roleType) => {
    setIdentifier(idVal);
    setPassword(passVal);
    handlePerformLogin(idVal, passVal, roleType);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-surface-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
          {/* Logo & Academy Name */}
          <div className="text-center mb-8">
            {academy.logo_url ? (
              <img src={academy.logo_url} alt="Logo" className="w-16 h-16 mx-auto mb-3 object-contain" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/30">
                <School className="w-8 h-8" />
              </div>
            )}
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {academy.academy_name}
            </h1>
            <p className="text-xs text-slate-400 mt-1 italic">{academy.tagline}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin or user@academy.edu"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-surface-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-surface-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {loading && activeRoleLoading === 'form' ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Instant Login Section */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="flex items-center justify-center gap-1.5 mb-3.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Instant 1-Click Login:
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {/* Admin Button */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDirectLogin('admin', 'admin123', 'admin')}
                className="group flex flex-col items-center justify-center py-2.5 px-2 rounded-xl bg-surface-800 hover:bg-brand-950/60 border border-slate-700 hover:border-brand-500/50 transition-all hover:shadow-lg hover:shadow-brand-500/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                title="Login immediately as Admin"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-500/15 text-brand-400 group-hover:bg-brand-500 group-hover:text-white flex items-center justify-center mb-1.5 transition-all">
                  {activeRoleLoading === 'admin' ? (
                    <div className="w-4 h-4 border-2 border-brand-400 group-hover:border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                </div>
                <span className="text-xs font-bold text-slate-200 group-hover:text-white">Admin</span>
                <span className="text-[10px] text-slate-500 group-hover:text-slate-400">Full Access</span>
              </button>

              {/* Teacher Button */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDirectLogin('t_rashid', 'teacher123', 'teacher')}
                className="group flex flex-col items-center justify-center py-2.5 px-2 rounded-xl bg-surface-800 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                title="Login immediately as Teacher"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center mb-1.5 transition-all">
                  {activeRoleLoading === 'teacher' ? (
                    <div className="w-4 h-4 border-2 border-emerald-400 group-hover:border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <GraduationCap className="w-4 h-4" />
                  )}
                </div>
                <span className="text-xs font-bold text-slate-200 group-hover:text-white">Teacher</span>
                <span className="text-[10px] text-slate-500 group-hover:text-slate-400">Faculty</span>
              </button>

              {/* Student Button */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDirectLogin('s_ahmed', 'student123', 'student')}
                className="group flex flex-col items-center justify-center py-2.5 px-2 rounded-xl bg-surface-800 hover:bg-purple-950/60 border border-slate-700 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                title="Login immediately as Student"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 group-hover:bg-purple-500 group-hover:text-white flex items-center justify-center mb-1.5 transition-all">
                  {activeRoleLoading === 'student' ? (
                    <div className="w-4 h-4 border-2 border-purple-400 group-hover:border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <UserCheck className="w-4 h-4" />
                  )}
                </div>
                <span className="text-xs font-bold text-slate-200 group-hover:text-white">Student</span>
                <span className="text-[10px] text-slate-500 group-hover:text-slate-400">Portal</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-slate-500">
          <p>Apex Horizon Academy Management System • Protected Access</p>
        </div>
      </div>
    </div>
  );
};
