import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Users, GraduationCap, School, CreditCard, ChevronRight } from 'lucide-react';
import api from '../services/api';

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ students: [], teachers: [], classes: [], fees: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults({ students: [], teachers: [], classes: [], fees: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
        if (res.data?.success) {
          setResults(res.data.results);
        }
      } catch (e) {
        // Search error
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Global hotkey Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose(); // toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

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

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Search input bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            placeholder="Type student name, roll number, teacher, class or fee status..."
            className="w-full bg-transparent text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 mr-1">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-surface-800 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
          {loading && (
            <p className="text-center text-xs text-slate-400 py-6">Searching records...</p>
          )}

          {!loading && !hasResults && query.trim().length >= 2 && (
            <p className="text-center text-xs text-slate-400 py-6">No matching records found for "{query}".</p>
          )}

          {!loading && !hasResults && query.trim().length < 2 && (
            <p className="text-center text-xs text-slate-400 py-6">
              Search by Student name, Roll Number, Teacher, Class name or Fee status.
            </p>
          )}

          {/* Students */}
          {results.students.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">Students</span>
              <div className="mt-1 space-y-1">
                {results.students.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleSelect(`/admin/students`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-surface-800 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-50 dark:bg-brand-950/40 text-brand-600 rounded-lg">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{s.full_name}</p>
                        <p className="text-xs text-slate-400">Roll: {s.roll_number} | Class: {s.class_name}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Teachers */}
          {results.teachers.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">Teachers</span>
              <div className="mt-1 space-y-1">
                {results.teachers.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleSelect(`/admin/teachers`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-surface-800 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-lg">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{t.full_name}</p>
                        <p className="text-xs text-slate-400">{t.specialization || 'Teacher'} | Ph: {t.phone}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fees */}
          {results.fees.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">Fees & Invoices</span>
              <div className="mt-1 space-y-1">
                {results.fees.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => handleSelect(`/admin/fees`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-surface-800 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-lg">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">
                          {f.student_name} - {f.month_year}
                        </p>
                        <p className="text-xs text-slate-400">
                          Total: {f.total_amount} | Status: <span className="uppercase font-semibold">{f.status}</span>
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
