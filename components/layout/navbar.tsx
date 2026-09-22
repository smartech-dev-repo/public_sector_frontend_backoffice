import * as React from 'react';

import { cn } from '@/lib/utils';

export type NavbarProps = React.HTMLAttributes<HTMLElement> & {
  logo?: React.ReactNode;
  /** Main navigation (e.g. links). Hidden on small screens unless composed elsewhere. */
  nav?: React.ReactNode;
  /** Right-aligned actions (theme toggle, profile, etc.). */
  actions?: React.ReactNode;
};

export function Navbar({ className, logo, nav, actions, ...props }: NavbarProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70',
        className,
      )}
      {...props}
    >
      <div className="container-app flex h-14 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4 md:gap-8">
          <div className="flex shrink-0 items-center gap-2">{logo}</div>
          {nav ? (
            <nav className="hidden min-w-0 items-center gap-6 md:flex" aria-label="Main">
              {nav}
            </nav>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
