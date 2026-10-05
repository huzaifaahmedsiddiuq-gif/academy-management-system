import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAcademy } from '../../context/AcademyContext';
import { useToast } from '../../context/ToastContext';

// Demo credentials — update these to match your live demo accounts
const DEMO_ROLES = [
  { label: 'Admin',   username: 'admin',    password: 'admin123' },
  { label: 'Teacher', username: 't_rashid', password: 'teacher123' },
  { label: 'Student', username: 's_ahmed',  password: 'student123' },
];

export const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState(null);

  const { login } = useAuth();
  const { academy } = useAcademy();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.warning('Please enter username and password');
      return;
    }
    setLoading(true);
    try {
      const user = await login(identifier, password);
      toast.success(`Welcome back, ${user.username}!`);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'teacher') navigate('/teacher/dashboard');
      else if (user.role === 'student') navigate('/student/dashboard');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    setIdentifier(role.username);
    setPassword(role.password);
    setActiveDemo(role.label);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      {/* Background glows */}
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

          {/* Sign-in form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => { setIdentifier(e.target.value); setActiveDemo(null); }}
                  placeholder="Enter your username or email"
                  autoComplete="username"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-surface-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setActiveDemo(null); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-11 py-2.5 text-sm bg-surface-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* ── Quick Demo Access ── */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex-1 h-px bg-slate-800" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                Quick Demo Access
              </span>
              <span className="flex-1 h-px bg-slate-800" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {DEMO_ROLES.map((role) => {
                const isActive = activeDemo === role.label;
                return (
                  <button
                    key={role.label}
                    type="button"
                    onClick={() => fillDemo(role)}
                    className={`py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                      isActive
                        ? 'bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-500/30 scale-[1.04]'
                        : 'bg-surface-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200 hover:bg-surface-700'
                    }`}
                  >
                    {role.label}
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] text-slate-600 text-center mt-2.5">
              Click a role to auto-fill credentials, then press Sign In
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-500">
          <p>Apex Horizon Academy Management System • Protected Access</p>
        </div>
      </div>
    </div>
  );
};
