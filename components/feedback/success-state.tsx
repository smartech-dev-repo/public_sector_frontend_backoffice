import { CheckCircle2 } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

export type SuccessStateProps = React.HTMLAttributes<HTMLDivElement> & {
  title: string;
  description?: string;
};

export function SuccessState({ className, title, description, ...props }: SuccessStateProps) {
  return (
    <div
      role="status"
      className={cn(
        'flex min-h-[10rem] flex-col items-center justify-center gap-2 rounded-xl border border-success/30 bg-success/5 p-4 md:p-8 text-center',
        className,
      )}
      {...props}
    >
      <CheckCircle2 className="size-10 text-success" aria-hidden />
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}
