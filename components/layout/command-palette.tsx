import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from 'cmdk';
import { Search } from 'lucide-react';
import * as React from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/layout/dialog';
export type CommandAction = {
  id: string;
  label: string;
  shortcut?: string;
  onSelect: () => void;
  group?: string;
};

export type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: CommandAction[];
  placeholder?: string;
};

export function CommandPalette({
  open,
  onOpenChange,
  actions,
  placeholder = 'Type a command or search…',
}: CommandPaletteProps) {
  const groups = React.useMemo(() => {
    const map = new Map<string, CommandAction[]>();
    for (const a of actions) {
      const g = a.group ?? 'General';
      map.set(g, [...(map.get(g) ?? []), a]);
    }
    return map;
  }, [actions]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0 rounded-2xl sm:rounded-2xl">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <DialogDescription className="sr-only">
          Search and run commands. Use arrow keys to navigate, Enter to select, Escape to close.
        </DialogDescription>
        <Command className="rounded-lg border-none [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
          <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
            <Search className="me-2 size-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder={placeholder}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList className="max-h-72 overflow-y-auto p-2">
            <CommandEmpty>No results found.</CommandEmpty>
            {[...groups.entries()].map(([group, items]) => (
              <CommandGroup key={group} heading={group}>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${item.label} ${group}`}
                    onSelect={() => {
                      item.onSelect();
                      onOpenChange(false);
                    }}
                    className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
                  >
                    <span>{item.label}</span>
                    {item.shortcut ? (
                      <kbd className="pointer-events-none hidden rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-block">
                        {item.shortcut}
                      </kbd>
                    ) : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
