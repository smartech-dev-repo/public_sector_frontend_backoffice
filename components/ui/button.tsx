import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
        secondary:
          'border border-border/60 bg-secondary text-secondary-foreground hover:bg-secondary/85 active:bg-secondary/75',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80',
        soft: 'bg-soft text-soft-foreground hover:bg-soft/80 active:bg-soft/70',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        xs: 'h-7 gap-1 px-2 text-xs [&_svg]:size-3.5',
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4 py-2',
        lg: 'h-10 px-5 text-base',
        xl: 'h-12 px-3 md:px-6 text-base [&_svg]:size-5',
        icon: 'h-9 w-9 p-0',
      },
      visualState: {
        default: '',
        success:
          'border border-success/30 bg-success/10 text-success hover:bg-success/15 active:bg-success/20',
        error:
          'border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15',
      },
    },
    compoundVariants: [
      {
        variant: 'link',
        size: 'xs',
        class: 'h-auto px-0 py-0',
      },
      {
        variant: 'link',
        size: 'sm',
        class: 'h-auto px-0 py-0',
      },
      {
        variant: 'link',
        size: 'md',
        class: 'h-auto px-0 py-0',
      },
      {
        variant: 'link',
        size: 'lg',
        class: 'h-auto px-0 py-0',
      },
      {
        variant: 'link',
        size: 'xl',
        class: 'h-auto px-0 py-0',
      },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      visualState: 'default',
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      visualState,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, visualState, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        data-state={loading ? 'loading' : undefined}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            <span className="sr-only">Loading</span>
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export type IconButtonProps = Omit<ButtonProps, 'size' | 'children'> & {
  'aria-label': string;
  children: React.ReactNode;
  size?: ButtonProps['size'];
};

const iconSizeMap = {
  xs: 'size-7',
  sm: 'size-8',
  md: 'size-9',
  lg: 'size-10',
  xl: 'size-12',
  icon: 'size-9',
} as const;

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = 'md', children, ...props }, ref) => (
    <Button
      ref={ref}
      size={size}
      className={cn(iconSizeMap[size ?? 'md'], 'p-0', className)}
      {...props}
    >
      {children}
    </Button>
  ),
);
IconButton.displayName = 'IconButton';

export { Button, buttonVariants, IconButton };
