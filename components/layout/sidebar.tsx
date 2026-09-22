import * as React from 'react';
import { ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export type SidebarNavItem = {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  active?: boolean;
  isCategoryHeader?: boolean;
  children?: SidebarNavItem[];
};

export type SidebarProps = React.HTMLAttributes<HTMLElement> & {
  header?: React.ReactNode;
  title?: string;
  items: SidebarNavItem[];
  onNavigate?: (id: string, href?: string) => void;
  footer?: React.ReactNode;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

export function Sidebar({
  className,
  header,
  title,
  items,
  onNavigate,
  footer,
  collapsed = false,
  onToggleCollapse,
  ...props
}: SidebarProps) {
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  // Expand parent item automatically if a child is active
  React.useEffect(() => {
    const nextExpanded = { ...expanded };
    let changed = false;
    for (const item of items) {
      if (item.children && !expanded[item.id]) {
        const hasActiveChild = item.children.some((child) => child.active);
        if (hasActiveChild) {
          nextExpanded[item.id] = true;
          changed = true;
        }
      }
    }
    if (changed) {
      setExpanded(nextExpanded);
    }
  }, [items]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside
      className={cn(
        'flex h-full min-h-0 shrink-0 flex-col border-e border-[#114d2a] bg-[#156336] text-white transition-[width] duration-200',
        collapsed ? 'w-14' : 'w-72',
        className,
      )}
      {...props}
    >
      <div className={cn('flex shrink-0 items-center', collapsed ? 'justify-center p-4' : 'px-3 md:px-6 pt-6 pb-2')}>
        {!collapsed && header ? <div className="min-w-0 flex-1">{header}</div> : null}
        {onToggleCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-card/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </button>
        ) : null}
      </div>
      {!collapsed && title ? (
        <div className="border-b px-4 py-3 text-sm font-semibold tracking-tight">{title}</div>
      ) : null}

      <ScrollArea className="min-h-0 flex-1">
        <nav
          className={cn('flex flex-col gap-0.5 p-2', collapsed && 'items-center')}
          aria-label="Sidebar"
        >
          {items.map((item) => {
            // Skip category headers when collapsed
            if (item.isCategoryHeader) {
              if (collapsed) return null;
              return (
                <div
                  key={item.id}
                  className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-wider text-white/60 first:pt-2"
                >
                  {item.label}
                </div>
              );
            }

            // ── Collapsed rendering ──────────────────────────────────────
            if (collapsed) {
              const isParent = item.children && item.children.length > 0;
              const firstHref = isParent ? item.children![0]?.href : item.href;
              const isActive = item.active || (isParent && item.children!.some((c) => c.active));

              const iconCls = cn(
                'flex size-10 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? 'bg-card text-[#156336]'
                  : 'text-white/70 hover:bg-card/10 hover:text-white',
              );

              if (firstHref && !onNavigate) {
                return (
                  <a key={item.id} href={firstHref} className={iconCls} title={item.label} aria-current={isActive ? 'page' : undefined}>
                    {item.icon}
                  </a>
                );
              }
              return (
                <button
                  key={item.id}
                  type="button"
                  className={iconCls}
                  title={item.label}
                  onClick={() => onNavigate?.(item.id, firstHref)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.icon}
                </button>
              );
            }

            // ── Expanded: parent with collapsible children ───────────────
            if (item.children && item.children.length > 0) {
              const isExpanded = expanded[item.id];
              const parentActive = item.active || item.children.some((child) => child.active);

              const parentBase =
                'flex w-full items-center justify-between rounded-full px-4 py-2 text-start text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
              const parentState = parentActive
                ? 'bg-card/10 text-white'
                : 'text-white/80 hover:bg-card/10 hover:text-white';

              return (
                <div key={item.id} className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    className={cn(parentBase, parentState)}
                    onClick={() => toggleExpand(item.id)}
                  >
                    <div className="flex items-start gap-2 min-w-0 flex-1 text-left">
                      {item.icon ? <span className={cn("mt-0.5", parentActive ? "text-white" : "text-white/70")}>{item.icon}</span> : null}
                      <span className="whitespace-normal break-words flex-1">{item.label}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="size-3.5 shrink-0 text-white/60 transition-transform ml-2" />
                    ) : (
                      <ChevronRight className="size-3.5 shrink-0 text-white/60 transition-transform ml-2" />
                    )}
                  </button>

                  {isExpanded ? (
                    <div className="mt-0.5 flex flex-col gap-0.5 pl-6 border-l ml-5 border-white/20">
                      {item.children.map((child) => {
                        const childContent = (
                          <>
                            {child.icon ? <span className={cn("mt-0.5", child.active ? "text-white" : "text-white/70")}>{child.icon}</span> : null}
                            <span className="whitespace-normal break-words flex-1 text-left">{child.label}</span>
                          </>
                        );

                        const childBase =
                          'flex w-full items-start gap-2 rounded-md px-3 py-1.5 text-start text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring relative group';
                        const childState = child.active
                          ? 'text-white font-semibold bg-card/10'
                          : 'text-white/70 hover:bg-card/5 hover:text-white';

                        if (child.href && !onNavigate) {
                          return (
                            <a key={child.id} href={child.href} className={cn(childBase, childState)}>
                              {child.active && (
                                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded bg-card" />
                              )}
                              {childContent}
                            </a>
                          );
                        }

                        return (
                          <button
                            key={child.id}
                            type="button"
                            className={cn(childBase, childState)}
                            onClick={() => onNavigate?.(child.id, child.href)}
                            aria-current={child.active ? 'page' : undefined}
                          >
                            {child.active && (
                              <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded bg-card" />
                            )}
                            {childContent}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            }

            // ── Expanded: standard flat item ─────────────────────────────
            const content = (
              <>
                {item.icon ? <span className={cn("mt-0.5", item.active ? "text-[#156336]" : "text-white/70")}>{item.icon}</span> : null}
                <span className="whitespace-normal break-words flex-1 text-left">{item.label}</span>
              </>
            );
            const base =
              'flex w-full items-start gap-2 rounded-full px-4 py-2.5 text-start text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
            const state = item.active
              ? 'bg-card text-[#156336]'
              : 'text-white/80 hover:bg-card/10 hover:text-white';

            if (item.href && !onNavigate) {
              return (
                <a key={item.id} href={item.href} className={cn(base, state)}>
                  {content}
                </a>
              );
            }
            return (
              <button
                key={item.id}
                type="button"
                className={cn(base, state)}
                onClick={() => onNavigate?.(item.id, item.href)}
                aria-current={item.active ? 'page' : undefined}
              >
                {content}
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      {footer && !collapsed ? <div className="mt-auto border-t p-3">{footer}</div> : null}
    </aside>
  );
}
