import { AnimatePresence, motion } from 'framer-motion';

import { Spinner } from '@/components/feedback/spinner';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

export type LoadingOverlayProps = {
  show: boolean;
  label?: string;
  className?: string;
};

export function LoadingOverlay({ show, label = 'Loading', className }: LoadingOverlayProps) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          role="status"
          aria-live="polite"
          aria-busy="true"
          aria-label={label}
          className={cn(
            'fixed inset-0 z-[100] flex items-center justify-center bg-background/70 backdrop-blur-sm',
            className,
          )}
          initial={reduce ? undefined : { opacity: 0 }}
          animate={reduce ? undefined : { opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="flex flex-col items-center gap-3 rounded-xl border bg-card px-4 md:px-8 py-6">
            <Spinner size="lg" />
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
