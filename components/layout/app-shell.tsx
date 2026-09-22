import { Menu } from 'lucide-react';
import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';


import { cn } from '@/lib/utils';

import { Breadcrumbs, type BreadcrumbItem } from './breadcrumbs';
import { Drawer, DrawerContent, DrawerTrigger } from './drawer';
import { Sidebar, type SidebarNavItem } from './sidebar';
import { Button } from '../ui/button';
import { RateLimitModal } from './rate-limit-modal';

export type AppShellProps = {
  breadcrumbs: BreadcrumbItem[];
  sidebarItems: SidebarNavItem[];
  children: React.ReactNode;
  /** When set, replaces the default logo block in the sidebar (desktop and mobile). */
  sidebarHeader?: React.ReactNode;
  sidebarFooter?: React.ReactNode;
  /** Centered element in the header (e.g. search bar). */
  headerCenter?: React.ReactNode;
  headerActions?: React.ReactNode;
  onSidebarNavigate?: (id: string, href?: string) => void;
  mainClassName?: string;
};

export function AppShell({
  breadcrumbs,
  sidebarItems,
  children,
  sidebarHeader,
  sidebarFooter,
  headerCenter,
  headerActions,
  onSidebarNavigate,
  mainClassName = 'container-app px-3 md:px-8 py-4 md:py-8',
}: AppShellProps) {
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(() => {
    try { return localStorage.getItem('sidebar-collapsed') === 'true'; } catch { return false; }
  });

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem('sidebar-collapsed', String(next)); } catch {}
      return next;
    });
  };

  const handleSidebarNavigate = (id: string, href?: string) => {
    onSidebarNavigate?.(id, href);
    if (!onSidebarNavigate) {
      if (href) {
        navigate(href);
      } else {
        if (id === 'dashboard') navigate('/');
        if (id === 'docs') navigate('/docs');
        if (id === 'components') navigate('/components');
      }
    }
    setMobileNavOpen(false);
  };

  const defaultSidebarHeader = (
    <Link to="/" className="flex items-center text-lg font-bold">
      Public Sector Admin
    </Link>
  );

  return (
    <div className="flex min-h-dvh w-full items-stretch bg-muted/50">
      <Sidebar
        className="fixed inset-y-0 inset-s-0 z-30 hidden border-e md:flex"
        header={sidebarHeader ?? defaultSidebarHeader}
        items={sidebarItems}
        onNavigate={handleSidebarNavigate}
        footer={sidebarFooter}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      <div className={cn('min-h-dvh min-w-0 flex-1 transition-[margin] duration-200', sidebarCollapsed ? 'md:ms-14' : 'md:ms-72')}>
        <header className="sticky top-0 z-20 w-full border-b bg-card">
          <div className="container-app grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-3">
            {/* Left – breadcrumbs */}
            <div className="flex min-w-0 items-center gap-2">
              <Drawer open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <DrawerTrigger asChild>
                  <Button type="button" variant="ghost" size="md" className="size-9 p-0 md:hidden" aria-label="Open navigation">
                    <Menu className="size-5" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="inset-y-0 left-0 right-auto mt-0 h-full w-[18rem] max-w-[85vw] rounded-none border-e border-t-0">
                  <Sidebar
                    className="h-full w-full border-0"
                    header={sidebarHeader ?? defaultSidebarHeader}
                    items={sidebarItems}
                    onNavigate={handleSidebarNavigate}
                    footer={sidebarFooter}
                  />
                </DrawerContent>
              </Drawer>
              <Breadcrumbs items={breadcrumbs} />
            </div>
            {/* Center – search bar */}
            <div className="flex items-center justify-center">
              {headerCenter}
            </div>
            {/* Right – actions */}
            <div className="flex items-center justify-end gap-2">
              {headerActions}
            </div>
          </div>
        </header>

        <main className={mainClassName}>{children}</main>
      </div>
      <RateLimitModal />
    </div>
  );
}
