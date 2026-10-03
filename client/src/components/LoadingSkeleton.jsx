import React from 'react';

export const LoadingSkeleton = ({ count = 3, type = 'card' }) => {
  return (
    <div className="space-y-4 animate-pulse">
      {type === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-surface-800 rounded-2xl" />
          ))}
        </div>
      )}

      {type === 'table' && (
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="h-6 w-1/4 bg-slate-200 dark:bg-surface-800 rounded" />
          <div className="h-10 bg-slate-100 dark:bg-surface-800 rounded-xl" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-slate-50 dark:bg-surface-800/60 rounded-lg" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
