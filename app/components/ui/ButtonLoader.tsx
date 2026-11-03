import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonLoaderProps {
  loading: boolean;
  children?: React.ReactNode;
  loadingText?: string;
  className?: string;
  spinnerClassName?: string;
}

export function ButtonLoader({
  loading,
  children,
  loadingText,
  className,
  spinnerClassName = 'w-4 h-4 animate-spin shrink-0'
}: ButtonLoaderProps) {
  if (!loading) {
    return <>{children}</>;
  }

  return (
    <span className={cn('inline-flex items-center justify-center gap-2', className)}>
      <Loader2 className={spinnerClassName} aria-hidden />
      <span>{loadingText || children}</span>
    </span>
  );
}

export default ButtonLoader;
