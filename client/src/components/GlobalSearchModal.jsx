import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Users, GraduationCap, School, CreditCard, ChevronRight, AlertCircle, ArrowUpDown } from 'lucide-react';
import api from '../services/api';

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ students: [], teachers: [], classes: [], fees: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults({ students: [], teachers: [], classes: [], fees: [] });
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query.trim())}`);
        if (res.data?.success) {
          setResults(res.data.results);
        } else {
          setResults({ students: [], teachers: [], classes: [], fees: [] });
        }
      } catch (e) {
        setError('Search failed. Please try again.');
        setResults({ students: [], teachers: [], classes: [], fees: [] });
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Reset state and focus input when modal opens / closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults({ students: [], teachers: [], classes: [], fees: [] });
      setError(null);
    } else {
      // Focus search input on open
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (url) => {
    onClose();
    navigate(url);
  };

  const hasResults =
    results.students.length > 0 ||
    results.teachers.length > 0 ||
    results.classes.length > 0 ||
    results.fees.length > 0;

  // Fee status badge color
  const feeStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'paid') return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (s === 'partial') return 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400';
    return 'text-rose-600 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Search input bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Student name, roll no, teacher, class, fee status..."
            className="w-full bg-transparent text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 mr-1 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-surface-800 rounded border border-slate-200 dark:border-slate-700 flex-shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 py-6">
              <svg className="animate-spin w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Searching records...
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex items-center gap-2 text-xs text-rose-500 py-4 px-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* No results */}
          {!loading && !error && !hasResults && query.trim().length >= 2 && (
            <p className="text-center text-xs text-slate-400 py-6">
              No matching records found for &ldquo;<strong>{query}</strong>&rdquo;.
            </p>
          )}

          {/* Prompt */}
          {!loading && !error && !hasResults && query.trim().length < 2 && (
            <p className="text-center text-xs text-slate-400 py-6">
              Search by Student name, Roll Number, Teacher, Class name or Fee status.
            </p>
          )}

          {/* ── Students ── */}
          {!loading && results.students.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1.5">
                <Users className="w-3 h-3" /> Students ({results.students.length})
              </span>
              <div className="mt-1 space-y-1">
                {results.students.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleSelect(`/admin/students`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-surface-800 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-50 dark:bg-brand-950/40 text-brand-600 rounded-lg flex-shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{s.full_name}</p>
                        <p className="text-xs text-slate-400">
                          Roll: <span className="text-slate-600 dark:text-slate-300 font-medium">{s.roll_number || '—'}</span>
                          {s.class_name && <> &nbsp;|&nbsp; Class: <span className="text-slate-600 dark:text-slate-300 font-medium">{s.class_name}</span></>}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Teachers ── */}
          {!loading && results.teachers.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1.5">
                <GraduationCap className="w-3 h-3" /> Teachers ({results.teachers.length})
              </span>
              <div className="mt-1 space-y-1">
                {results.teachers.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleSelect(`/admin/teachers`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-surface-800 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-lg flex-shrink-0">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{t.full_name}</p>
                        <p className="text-xs text-slate-400">
                          {t.specialization || 'Teacher'}
                          {t.phone && <> &nbsp;|&nbsp; Ph: <span className="text-slate-600 dark:text-slate-300 font-medium">{t.phone}</span></>}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Classes ── */}
          {!loading && results.classes.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1.5">
                <School className="w-3 h-3" /> Classes ({results.classes.length})
              </span>
              <div className="mt-1 space-y-1">
                {results.classes.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelect(`/admin/classes`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-surface-800 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-violet-50 dark:bg-violet-950/40 text-violet-600 rounded-lg flex-shrink-0">
                        <School className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">
                          {c.name}{c.section ? ` — ${c.section}` : ''}
                        </p>
                        {c.monthly_tuition_fee != null && (
                          <p className="text-xs text-slate-400">
                            Monthly Fee: <span className="text-slate-600 dark:text-slate-300 font-medium">Rs. {c.monthly_tuition_fee}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Fees & Invoices ── */}
          {!loading && results.fees.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1.5">
                <CreditCard className="w-3 h-3" /> Fees &amp; Invoices ({results.fees.length})
              </span>
              <div className="mt-1 space-y-1">
                {results.fees.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => handleSelect(`/admin/fees`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-surface-800 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-lg flex-shrink-0">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">
                          {f.student_name} — {f.month_year}
                        </p>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5">
                          Total: <span className="text-slate-600 dark:text-slate-300 font-medium">Rs. {f.total_amount}</span>
                          &nbsp;|&nbsp; Status:&nbsp;
                          <span className={`px-1.5 py-0.5 rounded font-semibold uppercase text-[10px] ${feeStatusColor(f.status)}`}>
                            {f.status}
                          </span>
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-surface-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded shadow-xs text-slate-600 dark:text-slate-300">
              ESC
            </kbd>
            <span>to close</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded shadow-xs text-slate-600 dark:text-slate-300">
              Ctrl + K
            </kbd>
            <span>to toggle</span>
          </div>
        </div>
      </div>
    </div>
  );
};
