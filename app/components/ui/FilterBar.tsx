"use client";

import { useEffect, useRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Check, Plus, Search, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDefinition {
  key: string;
  label: string;
  type: 'select' | 'text' | 'dateRange' | 'date' | 'month';
  value: string;
  onChange: (value: string) => void;
  options?: FilterOption[];
  placeholder?: string;
  // What this screen stores for "no filter": '', 'all' or 'none'.
  emptyValue?: string;
}

export interface FilterBarProps {
  search?: { value: string; onChange: (value: string) => void; placeholder?: string };
  filters: FilterDefinition[];
  // Runs on every search or filter change; lists use it to return to page 1.
  onChange?: () => void;
  children?: ReactNode;
  className?: string;
}

export const AGENCY_FILTER_OPTIONS: FilterOption[] = ['NPF', 'NSCDC', 'IMMIGRATION', 'CORRECTIONAL', 'CUSTOM', 'LASG'].map((value) => ({ value, label: value }));

const TYPING_DEBOUNCE_MS = 300;

// A date-only "to" would mean midnight at the start of that day and drop the whole
// day from the results, so a range always runs to the end of its last day.
export function dateRangeParams(range: string, fromKey: string, toKey: string): Record<string, string> {
  const [from, to] = range ? range.split(' to ') : [];
  if (!from) return {};
  return { [fromKey]: `${from}T00:00:00.000Z`, [toKey]: `${to || from}T23:59:59.999Z` };
}

const CHIP_CLASS = 'h-10 inline-flex items-center rounded-full text-[13px] font-medium whitespace-nowrap transition-colors';
const INPUT_CLASS = 'w-full h-10 px-3 rounded-lg text-sm bg-card text-foreground border border-border outline-none focus:ring-2 focus:ring-[#018752]/20 focus:border-[#018752]';

interface DebouncedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string;
  onValueChange: (value: string) => void;
}

// Typing stays instant here, while the list only refetches once the user pauses.
function DebouncedInput({ value, onValueChange, ...props }: DebouncedInputProps) {
  const [text, setText] = useState(value);
  const latest = useRef({ onValueChange, text, value });
  latest.current = { onValueChange, text, value };

  useEffect(() => setText(value), [value]);

  // Closing a chip's popover right after typing must not lose the value.
  useEffect(() => () => {
    if (latest.current.text !== latest.current.value) latest.current.onValueChange(latest.current.text);
  }, []);

  useEffect(() => {
    if (text === value) return;
    const timer = setTimeout(() => latest.current.onValueChange(text), TYPING_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text, value]);

  return <input {...props} value={text} onChange={(e) => setText(e.target.value)} />;
}

function isActive(filter: FilterDefinition): boolean {
  return filter.value !== (filter.emptyValue ?? '') && filter.value !== '';
}

function displayValue(filter: FilterDefinition): string {
  if (filter.type === 'select') {
    return filter.options?.find((option) => option.value === filter.value)?.label ?? filter.value;
  }
  return filter.value;
}

function FilterEditor({ filter, onDone }: { filter: FilterDefinition; onDone: () => void }) {
  if (filter.type === 'select') {
    return (
      <div role="listbox" aria-label={filter.label} className="max-h-64 overflow-y-auto">
        {filter.options?.map((option) => (
          <button
            key={option.value}
            type="button"
            role="option"
            aria-selected={option.value === filter.value}
            onClick={() => { filter.onChange(option.value); onDone(); }}
            className="w-full min-h-10 flex items-center justify-between gap-2 px-2.5 rounded-lg text-left text-sm text-foreground hover:bg-muted/50"
          >
            {option.label}
            {option.value === filter.value && <Check className="w-4 h-4 text-[#018752] shrink-0" />}
          </button>
        ))}
      </div>
    );
  }

  if (filter.type === 'dateRange') {
    const [from = '', to = ''] = filter.value ? filter.value.split(' to ') : [];
    const write = (nextFrom: string, nextTo: string) => {
      if (!nextFrom && !nextTo) filter.onChange(filter.emptyValue ?? '');
      else filter.onChange(nextFrom && nextTo ? `${nextFrom} to ${nextTo}` : nextFrom || nextTo);
    };
    return (
      <div className="space-y-2 p-1">
        <label className="block text-[11px] font-semibold text-muted-foreground">From
          <input type="date" value={from} max={to || undefined} onChange={(e) => write(e.target.value, to)} className={`${INPUT_CLASS} mt-1`} />
        </label>
        <label className="block text-[11px] font-semibold text-muted-foreground">To
          <input type="date" value={to} min={from || undefined} onChange={(e) => write(from, e.target.value)} className={`${INPUT_CLASS} mt-1`} />
        </label>
      </div>
    );
  }

  const inputType = filter.type === 'text' ? 'text' : filter.type;
  return (
    <div className="p-1">
      <DebouncedInput
        autoFocus
        aria-label={filter.label}
        type={inputType}
        value={filter.value === filter.emptyValue ? '' : filter.value}
        placeholder={filter.placeholder}
        onValueChange={(value) => filter.onChange(value || (filter.emptyValue ?? ''))}
        onKeyDown={(e) => { if (e.key === 'Enter') onDone(); }}
        className={INPUT_CLASS}
      />
    </div>
  );
}

function FilterChip({ filter, defaultOpen, onClosed, onRemove }: { filter: FilterDefinition; defaultOpen: boolean; onClosed: () => void; onRemove: () => void }) {
  const [open, setOpen] = useState(defaultOpen);
  const active = isActive(filter);
  const setPopover = (next: boolean) => {
    setOpen(next);
    if (!next) onClosed();
  };

  return (
    <span className={`${CHIP_CLASS} border border-[#A7D7BF] dark:border-emerald-800 bg-[#E8F5EE] dark:bg-emerald-950/30 text-[#016B41] dark:text-emerald-300`}>
      <Popover open={open} onOpenChange={setPopover}>
        <PopoverTrigger asChild>
          <button type="button" className="h-full pl-3.5 pr-1.5 rounded-l-full">
            {filter.label}{active && <> is <span className="font-semibold">{displayValue(filter)}</span></>}
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-1.5">
          <FilterEditor filter={filter} onDone={() => setPopover(false)} />
        </PopoverContent>
      </Popover>
      <button type="button" onClick={onRemove} aria-label={`Remove ${filter.label} filter`} className="h-full w-8 flex items-center justify-center rounded-r-full">
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  );
}

// Search plus only the filters in use; the rest wait behind "Add filter".
export default function FilterBar({ search, filters: filterProps, onChange, children, className = 'mb-4' }: FilterBarProps) {
  const filters = filterProps.map((filter) => ({
    ...filter,
    onChange: (value: string) => { onChange?.(); filter.onChange(value); },
  }));

  const [menuOpen, setMenuOpen] = useState(false);
  const [draftKey, setDraftKey] = useState<string | null>(null);
  const pendingKey = useRef<string | null>(null);

  const shown = filters.filter((filter) => isActive(filter) || filter.key === draftKey);
  const available = filters.filter((filter) => !shown.includes(filter));
  const anyActive = filters.some(isActive) || Boolean(search?.value);
  const clear = (filter: FilterDefinition) => filter.onChange(filter.emptyValue ?? '');

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {search && (
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <DebouncedInput
            aria-label="Search"
            value={search.value}
            onValueChange={(value) => { onChange?.(); search.onChange(value); }}
            placeholder={search.placeholder ?? 'Search'}
            className="w-full h-10 pl-10 pr-4 rounded-full text-sm bg-card text-foreground border border-border outline-none focus:ring-2 focus:ring-[#018752]/20 focus:border-[#018752]"
          />
        </div>
      )}

      {shown.map((filter) => (
        <FilterChip
          key={filter.key}
          filter={filter}
          defaultOpen={filter.key === draftKey}
          onClosed={() => setDraftKey(null)}
          onRemove={() => { setDraftKey(null); clear(filter); }}
        />
      ))}

      {available.length > 0 && (
        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          <PopoverTrigger asChild>
            <button type="button" className={`${CHIP_CLASS} gap-1.5 px-3.5 border border-dashed border-slate-400 text-foreground/80 hover:bg-muted/40`}>
              <Plus className="w-3.5 h-3.5" /> Add filter
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-56 p-1.5"
            // Opening the new chip's popover any earlier loses it: focus returning to
            // this button reads as a click outside that popover and closes it at once.
            onCloseAutoFocus={(event) => {
              if (!pendingKey.current) return;
              event.preventDefault();
              setDraftKey(pendingKey.current);
              pendingKey.current = null;
            }}
          >
            <div role="menu" aria-label="Add filter">
              {available.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  role="menuitem"
                  onClick={() => { pendingKey.current = filter.key; setMenuOpen(false); }}
                  className="w-full min-h-10 px-2.5 rounded-lg text-left text-sm text-foreground hover:bg-muted/50"
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {anyActive && (
        <button
          type="button"
          onClick={() => { onChange?.(); search?.onChange(''); filters.forEach(clear); setDraftKey(null); }}
          className="h-10 px-2 text-[13px] font-medium text-muted-foreground hover:text-foreground"
        >
          Clear all
        </button>
      )}

      {children && <div className="ml-auto flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}
