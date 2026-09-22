import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { ChevronDown } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const Collapse = CollapsiblePrimitive.Root;

const CollapseTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.Trigger
    ref={ref}
    className={cn(
      'flex w-full items-center justify-between gap-2 rounded-md py-2 text-start text-sm font-medium transition-colors hover:text-foreground [&[data-state=open]>svg]:rotate-180',
      className,
    )}
    {...props}
  >
    {children}
    <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform" />
  </CollapsiblePrimitive.Trigger>
));
CollapseTrigger.displayName = CollapsiblePrimitive.Trigger.displayName;

const CollapseContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    className={cn(
      'overflow-hidden text-sm text-muted-foreground data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  >
    <div className="pb-2 pt-0">{children}</div>
  </CollapsiblePrimitive.Content>
));
CollapseContent.displayName = CollapsiblePrimitive.Content.displayName;

export { Collapse, CollapseContent, CollapseTrigger };
