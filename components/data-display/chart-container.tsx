import * as React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/data-display/card';
import { cn } from '@/lib/utils';

export type ChartContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
  description?: string;
};

/**
 * Wraps Recharts (or other chart libs) with consistent padding, border, and accessible headings.
 */
export function ChartContainer({
  className,
  title,
  description,
  children,
  ...props
}: ChartContainerProps) {
  return (
    <Card className={cn(className)} {...props}>
      {title || description ? (
        <CardHeader>
          {title ? <CardTitle>{title}</CardTitle> : null}
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
      ) : null}
      <CardContent className={cn(!title && !description && 'pt-6')}>
        <div className="h-[280px] w-full min-h-[200px]">{children}</div>
      </CardContent>
    </Card>
  );
}
