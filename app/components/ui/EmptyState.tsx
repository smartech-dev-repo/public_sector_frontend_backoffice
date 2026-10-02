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
    'flex min-h-[300px] w-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/60 bg-muted/20 p-8 text-center',
    className,
   )}
   {...props}
  >
   <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 text-muted-foreground/60 mb-2">
    {icon ? icon : <Sparkles className="h-8 w-8 stroke-[1.5]" />}
   </div>

   <div className="max-w-md space-y-1.5">
    <h3 className="text-lg font-semibold tracking-tight text-foreground">
     {title}
    </h3>
    {description ? (
     <p className="text-sm text-muted-foreground">
      {description}
     </p>
    ) : null}
   </div>

   {action ? <div className="mt-4">{action}</div> : null}
  </div>
 );
}

export default EmptyState;
