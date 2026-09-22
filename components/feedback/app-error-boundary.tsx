import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { ErrorState } from './error-state';

type AppErrorBoundaryProps = {
  children: React.ReactNode;
  className?: string;
};

type AppErrorBoundaryState = {
  error: Error | null;
};

export class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[AppErrorBoundary]', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div className={cn('container-app flex min-h-dvh flex-col items-center justify-center py-12', this.props.className)}>
          <ErrorState
            title="Something went wrong"
            message={
              error.message?.trim()
                ? error.message
                : 'An unexpected error occurred. Reload the page to try again. If the problem continues, contact support.'
            }
            onRetry={() => window.location.reload()}
            retryLabel="Reload page"
          />
          <Button type="button" variant="ghost" className="mt-6" asChild>
            <a href="/">Back to sign-in</a>
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
