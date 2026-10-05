import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, Lock, User, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAcademy } from '../../context/AcademyContext';
import { useToast } from '../../context/ToastContext';

// Demo credentials with custom role-based theme colors
const DEMO_ROLES = [
  {
    label: 'Admin',
    username: 'admin',
    password: 'admin123',
    activeClass: 'border border-indigo-200/90 bg-[#1a223e] text-white shadow-sm shadow-indigo-500/20',
    inactiveClass: 'border border-slate-700/80 bg-surface-800 text-slate-300 hover:border-indigo-400/50 hover:bg-indigo-950/30 hover:text-white',
  },
  {
    label: 'Teacher',
    username: 't_rashid',
    password: 'teacher123',
    activeClass: 'border border-emerald-400 bg-[#0d2826] text-emerald-200 shadow-sm shadow-emerald-500/20',
    inactiveClass: 'border border-slate-700/80 bg-surface-800 text-slate-300 hover:border-emerald-400/50 hover:bg-emerald-950/30 hover:text-white',
  },
  {
    label: 'Student',
    username: 's_ahmed',
    password: 'student123',
    activeClass: 'border border-purple-400 bg-[#22163b] text-purple-200 shadow-sm shadow-purple-500/20',
    inactiveClass: 'border border-slate-700/80 bg-surface-800 text-slate-300 hover:border-purple-400/50 hover:bg-purple-950/30 hover:text-white',
  },
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
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                QUICK DEMO ACCESS:
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {DEMO_ROLES.map((role) => {
                const isActive = activeDemo === role.label;
                return (
                  <button
                    key={role.label}
                    type="button"
                    onClick={() => fillDemo(role)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                      isActive ? role.activeClass : role.inactiveClass
                    }`}
                  >
                    {role.label}
                  </button>
                );
              })}
            </div>
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
