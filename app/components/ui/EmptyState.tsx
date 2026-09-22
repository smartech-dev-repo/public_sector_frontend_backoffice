import React from 'react';

interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({ message = "No records found matching your criteria." }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-400 bg-slate-50/50 rounded-lg">
      <svg className="w-12 h-12 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
      </svg>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
