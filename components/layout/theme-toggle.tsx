"use client";

import { Moon, Sun } from 'lucide-react';
import * as React from 'react';
import { useTheme } from 'next-themes';

import { IconButton } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/layout/tooltip';

export function ThemeToggle() {
 const [mounted, setMounted] = React.useState(false);
 const { theme, setTheme } = useTheme();

 React.useEffect(() => {
  setMounted(true);
 }, []);

 const cycle = React.useCallback(() => {
  const order = ['light', 'dark', 'system'];
  const i = order.indexOf(theme || 'system');
  setTheme(order[(i + 1) % order.length]!);
 }, [theme, setTheme]);

 const icon = (
  <>
   <Sun className="size-4 dark:hidden" />
   <Moon className="size-4 hidden dark:block" />
  </>
 );

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
