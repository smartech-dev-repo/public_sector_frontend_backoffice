import { AlertCircle } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ErrorStateProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function ErrorState({
  className,
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
  ...props
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex min-h-[12rem] flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 md:p-8 text-center',
        className,
      )}
      {...props}
    >
      <AlertCircle className="size-10 text-destructive" aria-hidden />
      <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry ? (
        <Button type="button" variant="outline" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
