import React from 'react';

interface PulseLoaderProps {
  rows?: number;
  className?: string;
}

export default function PulseLoader({ rows = 6, className = '' }: PulseLoaderProps) {
  return (
    <div className={`w-full min-w-full bg-card rounded-2xl border border-border overflow-hidden animate-pulse shadow-xs ${className}`}>
      {/* Table header skeleton matching the table thead */}
      <div className="h-14 bg-[#E9F4EE]/70 dark:bg-emerald-950/20 border-b border-border/60 flex items-center px-4 sm:px-6 gap-6 w-full">
        <div className="h-4 bg-emerald-700/20 dark:bg-emerald-400/20 rounded w-28 shrink-0"></div>
        <div className="h-4 bg-emerald-700/20 dark:bg-emerald-400/20 rounded w-36 shrink-0"></div>
        <div className="h-4 bg-emerald-700/20 dark:bg-emerald-400/20 rounded w-32 shrink-0"></div>
        <div className="h-4 bg-emerald-700/20 dark:bg-emerald-400/20 rounded w-28 shrink-0"></div>
        <div className="h-4 bg-emerald-700/20 dark:bg-emerald-400/20 rounded w-24 shrink-0"></div>
        <div className="h-4 bg-emerald-700/20 dark:bg-emerald-400/20 rounded w-20 shrink-0"></div>
        <div className="h-4 bg-emerald-700/20 dark:bg-emerald-400/20 rounded w-16 ml-auto shrink-0"></div>
      </div>
      {/* Table rows skeleton matching the table rows */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/40 w-full">
        {Array.from({ length: rows }).map((_, i) => (
          <div 
            key={i} 
            className="h-16 flex items-center px-4 sm:px-6 gap-6 w-full"
            style={{ opacity: Math.max(0.25, 1 - (i * 0.12)) }}
          >
            <div className="h-4 bg-muted rounded w-24 shrink-0"></div>
            <div className="h-4 bg-muted rounded w-36 shrink-0"></div>
            <div className="h-4 bg-muted rounded w-32 shrink-0"></div>
            <div className="h-4 bg-muted rounded w-28 shrink-0"></div>
            <div className="h-4 bg-muted rounded w-24 shrink-0"></div>
            <div className="h-6 bg-muted/70 rounded-full w-20 shrink-0"></div>
            <div className="size-8 bg-muted rounded-full ml-auto shrink-0"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
