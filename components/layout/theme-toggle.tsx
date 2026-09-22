"use client";

import { Monitor, Moon, Sun } from 'lucide-react';
import * as React from 'react';
import { useTheme } from 'next-themes';

import { IconButton } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/layout/tooltip';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycle = React.useCallback(() => {
    const order = ['light', 'dark', 'system'];
    const i = order.indexOf(theme || 'system');
    setTheme(order[(i + 1) % order.length]!);
  }, [theme, setTheme]);

  const icon =
    theme === 'dark' ? <Moon className="size-4" /> : theme === 'light' ? <Sun className="size-4" /> : <Monitor className="size-4" />;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <IconButton type="button" variant="ghost" aria-label={`Theme: ${theme}. Click to cycle.`} onClick={cycle}>
            {icon}
          </IconButton>
        </TooltipTrigger>
        <TooltipContent side="bottom">Theme: {theme}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
