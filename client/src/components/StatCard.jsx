import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'indigo', subtext, trend }) => {
  const colorMap = {
    indigo: 'from-indigo-500 to-indigo-600 text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40',
    emerald: 'from-emerald-500 to-teal-600 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
    amber: 'from-amber-500 to-orange-500 text-amber-500 bg-amber-50 dark:bg-amber-950/40',
    rose: 'from-rose-500 to-pink-600 text-rose-500 bg-rose-50 dark:bg-rose-950/40',
    purple: 'from-purple-500 to-violet-600 text-purple-500 bg-purple-50 dark:bg-purple-950/40',
    blue: 'from-blue-500 to-cyan-600 text-blue-500 bg-blue-50 dark:bg-blue-950/40',
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className="relative p-6 bg-white dark:bg-surface-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden">
      {/* Decorative top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${scheme.split(' ')[0]} ${scheme.split(' ')[1]}`} />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5 tracking-tight">
            {value}
          </h3>
        </div>

        <div className={`p-3 rounded-xl ${scheme.split(' ').slice(2).join(' ')} group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {(subtext || trend) && (
        <div className="mt-4 flex items-center justify-between text-xs">
          {subtext && <span className="text-slate-500 dark:text-slate-400">{subtext}</span>}
          {trend && (
            <span className="font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
