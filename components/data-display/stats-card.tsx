import * as React from 'react';

import { Card, CardContent } from '@/components/data-display/card';
import { cn } from '@/lib/utils';

export type StatsCardProps = React.HTMLAttributes<HTMLDivElement> & {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  trend?: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning';
};

const variantClass: Record<NonNullable<StatsCardProps['variant']>, string> = {
  default: '',
  primary: 'border-primary/20 bg-soft/50',
  success: 'border-success/20 bg-success/5',
  warning: 'border-warning/30 bg-warning/5',
};

export function StatsCard({
  className,
  label,
  value,
  hint,
  trend,
  variant = 'default',
  ...props
}: StatsCardProps) {
  return (
    <Card className={cn('border-l-[3px] border-l-primary rounded-xl overflow-hidden flex flex-col justify-center', variantClass[variant], className)} {...props}>
      <CardContent className="p-5">
        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-2">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl sm:text-[28px] font-bold tracking-tight text-foreground">{value}</h3>
          {trend ? <div className="text-xs font-semibold text-success flex items-center">{trend}</div> : null}
        </div>
        {hint ? <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
