import * as React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

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
        'group relative flex min-h-[400px] w-full flex-col items-center justify-center gap-6 overflow-hidden rounded-3xl border border-white/40 bg-card/20 p-12 text-center shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-2xl transition-all duration-700 hover:border-white/60 hover:shadow-[0_16px_64px_rgba(0,0,0,0.08)] hover:bg-card/30',
        className,
      )}
      {...props}
    >
      {/* Dynamic Background Elements */}
      <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-300/20 mix-blend-multiply blur-[80px] transition-all duration-1000 group-hover:bg-blue-400/30 group-hover:blur-[100px] group-hover:translate-x-10 group-hover:translate-y-10" />
      <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-300/20 mix-blend-multiply blur-[80px] transition-all duration-1000 group-hover:bg-purple-400/30 group-hover:blur-[100px] group-hover:-translate-x-10 group-hover:-translate-y-10" />
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Icon Container with multi-layered glow and animation */}
      <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-tr from-white/90 to-white/50 shadow-xl ring-1 ring-white/60 backdrop-blur-md transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-2xl">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-blue-500/10 to-purple-500/10 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
        <div className="relative text-foreground/90 transition-colors duration-700 group-hover:text-blue-600">
          {icon ? (
            icon
          ) : (
            <Sparkles className="h-12 w-12 stroke-[1.5]" />
          )}
        </div>
      </div>

      {/* Text Content */}
      <div className="relative z-10 max-w-md space-y-2">
        <h3 className="bg-gradient-to-br from-slate-800 to-slate-500 bg-clip-text text-xl font-bold tracking-tight text-transparent transition-all duration-700 group-hover:from-blue-600 group-hover:to-purple-600">
          {title}
        </h3>
        {description ? (
          <p className="text-sm font-medium leading-relaxed text-muted-foreground transition-colors duration-700 group-hover:text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {/* Action Button Container */}
      {action ? (
        <div className="relative z-10 mt-4 flex transform items-center justify-center opacity-90 transition-all duration-700 group-hover:-translate-y-1 group-hover:opacity-100">
          <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 blur-xl transition-all duration-700 group-hover:opacity-50 group-hover:blur-2xl" />
          {action}
        </div>
      ) : null}
    </div>
  );
}

export default EmptyState;
