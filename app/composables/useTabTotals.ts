"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

type ReportTotal = (total: number) => void;

const TabTotalContext = createContext<ReportTotal | null>(null);

/** Wrap a page's tab content so the open tab's list can report how many records it shows. */
export const TabTotalScope = TabTotalContext.Provider;

/**
 * The count beside each tab: the full total, except for the open tab, which shows
 * what its list shows right now, filters included. Leaving a tab drops its filtered
 * figure, since its filters reset when it closes.
 */
export const useTabTotals = (totals: Record<string, number>, activeId: string) => {
 const [live, setLive] = useState<{ id: string; total: number } | null>(null);
 const report = useCallback((total: number) => setLive({ id: activeId, total }), [activeId]);
 const shown = live && live.id === activeId ? { ...totals, [activeId]: live.total } : totals;
 return { shown, report };
};

/** Called by a tab's list with its current total. Ignores the empty first render before data loads. */
export const useReportTabTotal = (total: number | undefined, enabled = true) => {
 const report = useContext(TabTotalContext);
 const loaded = useRef(false);
 useEffect(() => {
  if (!enabled || !report || typeof total !== 'number') return;
  if (!loaded.current && total === 0) return;
  loaded.current = true;
  report(total);
 }, [report, total, enabled]);
};
