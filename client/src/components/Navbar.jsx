import React, { useState } from 'react';
import { Menu, Search, Sun, Moon, Bell, Check, ExternalLink } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const Navbar = ({ onOpenSidebar, onOpenSearch }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, role } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (e) {
      // Ignore
    }
  };

  const handleToggleNotifs = () => {
    if (!showNotifs) {
      fetchNotifications();
    }
    setShowNotifs(!showNotifs);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {}
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white/80 dark:bg-surface-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 no-print">
      {/* Left: Mobile Toggle & Quick Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-surface-800 rounded-xl lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {role === 'admin' && (
          <button
            onClick={onOpenSearch}
            className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-400 bg-slate-100 dark:bg-surface-800 rounded-xl hover:bg-slate-200 dark:hover:bg-surface-700 transition-colors border border-transparent dark:border-slate-700"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search anything...</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-700 rounded shadow-sm">
              ⌘K
            </kbd>
          </button>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mobile Search Button */}
        {role === 'admin' && (
          <button
            onClick={onOpenSearch}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-surface-800 rounded-xl sm:hidden"
          >
            <Search className="w-5 h-5" />
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle Theme"
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-surface-800 rounded-xl transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={handleToggleNotifs}
            title="Notifications"
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-surface-800 rounded-xl transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse ring-2 ring-white dark:ring-surface-900" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  Notifications ({unreadCount})
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-brand-600 hover:underline flex items-center gap-1 font-medium"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-surface-800 ${
                        !n.is_read ? 'bg-brand-50/50 dark:bg-brand-950/20' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <span className="font-semibold text-slate-900 dark:text-white">{n.title}</span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {new Date(n.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Badge */}
        <div className="hidden sm:flex items-center pl-2 border-l border-slate-200 dark:border-slate-800">
          <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900/50">
            {role}
          </span>
        </div>
      </div>
    </header>
  );
};
