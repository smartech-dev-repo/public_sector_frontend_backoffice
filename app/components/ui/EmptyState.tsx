import * as React from 'react';
import { cn } from '@/lib/utils';
import { SearchX } from 'lucide-react'; // Fallback icon

export type EmptyStateProps = React.HTMLAttributes<HTMLDivElement> & {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({
  className,
  icon,
  title,
  description,
  action,
  ...props
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        'relative flex min-h-[300px] w-full flex-col items-center justify-center gap-4 rounded-2xl border border-slate-100 bg-white/50 p-8 text-center shadow-sm backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500',
        className,
      )}
      {...props}
    >
      {/* Decorative background element */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/50 rounded-2xl pointer-events-none" />

      {/* Icon Container */}
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50/50 text-emerald-600 shadow-inner ring-1 ring-emerald-100/50 mb-2">
        {icon ? (
          icon
        ) : (
          <SearchX className="h-10 w-10 text-emerald-500/80 stroke-[1.5]" />
        )}
      </div>

      {/* Text Content */}
      <div className="relative z-10 max-w-sm space-y-2">
        <h3 className="text-xl font-semibold text-slate-800 tracking-tight">{title}</h3>
        {description ? (
          <p className="text-sm leading-relaxed text-slate-500">{description}</p>
        ) : null}
      </div>

      {/* Optional Action Button */}
      {action ? (
        <div className="relative z-10 mt-4 animate-in slide-in-from-bottom-2 duration-700 fade-in">
          {action}
        </div>
      ) : null}
    </div>
  );
}

export default EmptyState;
