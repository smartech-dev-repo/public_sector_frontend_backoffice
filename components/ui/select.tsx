import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp, Search } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const SelectSearchContext = React.createContext<{
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  forceSelect: (val: string) => void;
}>({
  searchQuery: '',
  setSearchQuery: () => {},
  forceSelect: () => {},
});

const Select = (props: React.ComponentProps<typeof SelectPrimitive.Root>) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [open, setOpen] = React.useState(props.defaultOpen || false);
  const [internalValue, setInternalValue] = React.useState(props.defaultValue || '');
  
  const isControlledOpen = props.open !== undefined;
  const currentOpen = isControlledOpen ? props.open : open;

  const isControlledValue = props.value !== undefined;
  const currentValue = isControlledValue ? props.value : internalValue;

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlledOpen) setOpen(newOpen);
    if (!newOpen) setSearchQuery('');
    if (props.onOpenChange) props.onOpenChange(newOpen);
  };

  const handleValueChange = (val: string) => {
    if (!isControlledValue) setInternalValue(val);
    setSearchQuery('');
    if (props.onValueChange) props.onValueChange(val);
  };

  const forceSelect = (val: string) => {
    handleValueChange(val);
    handleOpenChange(false);
  };

  const { defaultValue, ...restProps } = props;

  return (
    <SelectSearchContext.Provider value={{ searchQuery, setSearchQuery, forceSelect }}>
      <SelectPrimitive.Root 
        {...restProps} 
        value={currentValue || undefined}
        open={currentOpen}
        onOpenChange={handleOpenChange}
        onValueChange={handleValueChange}
      />
    </SelectSearchContext.Provider>
  );
};

const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    error?: boolean;
    success?: boolean;
  }
>(({ className, children, size = 'md', error, success, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex w-full items-center justify-between gap-2 rounded-md border border-input bg-background transition-[color,box-shadow] focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground overflow-hidden min-w-0 [&>span]:truncate [&>span]:min-w-0',
      size === 'xs' && 'h-7 px-2 text-xs',
      size === 'sm' && 'h-8 px-2.5 text-xs',
      size === 'md' && 'h-9 px-3 text-sm',
      size === 'lg' && 'h-10 px-3 text-base',
      size === 'xl' && 'h-11 px-4 text-lg',
      error && 'border-destructive focus:ring-destructive',
      success && 'border-success/50 focus:ring-success',
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="size-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <ChevronUp className="size-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <ChevronDown className="size-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => {
  const { searchQuery, setSearchQuery } = React.useContext(SelectSearchContext);

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-[min(24rem,var(--radix-select-content-available-height))] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground data-[state=closed]:animate-out data-[state=open]:animate-in pointer-events-auto',
          position === 'popper' &&
            'data-[side=left]:-translate-x-1 data-[side=top]:-translate-y-1 data-[side=right]:translate-x-1 data-[side=bottom]:translate-y-1',
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        
        <div className="p-1.5 sticky top-0 z-10 bg-popover border-b border-border/50 backdrop-blur-md">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 size-3.5 text-muted-foreground opacity-50" />
            <input
              className="flex h-8 w-full rounded-md border border-input bg-transparent py-1 pl-8 pr-3 text-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Enter' && e.key !== 'Escape') {
                  e.stopPropagation();
                }
              }}
            />
          </div>
        </div>

        <SelectPrimitive.Viewport
          className={cn(
            'p-1',
            position === 'popper' &&
              'w-full min-w-[var(--radix-select-trigger-width)]',
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('px-2 py-1.5 text-sm font-semibold', className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join(' ');
  if (React.isValidElement(node) && node.props && typeof node.props === 'object' && 'children' in node.props) {
    return extractText(node.props.children as React.ReactNode);
  }
  return '';
}

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, value, ...props }, ref) => {
  const { searchQuery, forceSelect } = React.useContext(SelectSearchContext);
  
  if (searchQuery) {
    const text = extractText(children);
    const q = searchQuery.toLowerCase();
    if (!text.toLowerCase().includes(q) && !value?.toLowerCase().includes(q)) {
      return null;
    }
  }

  return (
    <SelectPrimitive.Item
      ref={ref}
      value={value}
      onPointerUp={(e) => {
         e.preventDefault();
         e.stopPropagation();
         forceSelect(value!);
         if (props.onPointerUp) props.onPointerUp(e);
      }}
      onClick={(e) => {
         e.preventDefault();
         e.stopPropagation();
         forceSelect(value!);
         if (props.onClick) props.onClick(e);
      }}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground transition-colors',
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
