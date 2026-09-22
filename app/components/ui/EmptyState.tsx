import React from 'react';

interface EmptyStateProps {
  message?: string;
  title?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export default function EmptyState({ 
  message = "No records found matching your criteria.", 
  title = "No data found",
  icon,
  action
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-muted-foreground bg-muted/50 rounded-2xl border border-dashed border-border">
      {icon || (
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-muted-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
        </div>
      )}
      <h3 className="text-base font-bold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm text-center">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
