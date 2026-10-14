"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
  label: string;
  value: string;
  badge?: string;
  description?: string;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  triggerClassName?: string;
  maxDisplayTags?: number;
  disabled?: boolean;
  error?: boolean;
}

export const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      options,
      value = [],
      onChange,
      placeholder = "Select options...",
      searchPlaceholder = "Search...",
      className,
      triggerClassName,
      maxDisplayTags = 3,
      disabled = false,
      error = false,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");

    const filteredOptions = React.useMemo(() => {
      if (!searchQuery.trim()) return options;
      const q = searchQuery.toLowerCase().trim();
      return options.filter(
        (opt) =>
          opt.label.toLowerCase().includes(q) ||
          opt.value.toLowerCase().includes(q) ||
          (opt.badge && opt.badge.toLowerCase().includes(q))
      );
    }, [options, searchQuery]);

    const handleToggle = (optValue: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (disabled) return;
      if (value.includes(optValue)) {
        onChange(value.filter((v) => v !== optValue));
      } else {
        onChange([...value, optValue]);
      }
    };

    const handleRemoveTag = (optValue: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;
      onChange(value.filter((v) => v !== optValue));
    };

    const handleClearAll = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;
      onChange([]);
    };

    const handleSelectAll = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;
      // If all currently visible are selected, deselect them; otherwise select all options
      const allValues = options.map((o) => o.value);
      const isAllSelected = allValues.length > 0 && allValues.every((val) => value.includes(val));
      if (isAllSelected) {
        onChange([]);
      } else {
        onChange(allValues);
      }
    };

    const selectedOptions = React.useMemo(() => {
      return value
        .map((val) => options.find((opt) => opt.value === val) || { label: val, value: val })
        .filter(Boolean);
    }, [value, options]);

    const displayedTags = selectedOptions.slice(0, maxDisplayTags);
    const hiddenCount = selectedOptions.length - maxDisplayTags;
    const isAllSelected = options.length > 0 && options.every((opt) => value.includes(opt.value));

    return (
      <PopoverPrimitive.Root
        open={open}
        onOpenChange={(nextOpen) => {
          if (!disabled) {
            setOpen(nextOpen);
            if (!nextOpen) setSearchQuery("");
          }
        }}
      >
        <div className={cn("relative w-full", className)}>
          <PopoverPrimitive.Trigger
            ref={ref}
            type="button"
            disabled={disabled}
            className={cn(
              "w-full min-h-[46px] px-3.5 py-2 rounded-xl border bg-muted/30 border-border text-sm flex items-center justify-between gap-2 text-left transition-all",
              "hover:border-[#018752]/50 hover:bg-muted/40",
              "focus:outline-none focus:ring-2 focus:ring-[#018752]/20 focus:border-[#018752]",
              error && "border-destructive focus:ring-destructive/20 focus:border-destructive",
              disabled && "opacity-50 cursor-not-allowed",
              triggerClassName
            )}
          >
            <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0 pr-1">
              {selectedOptions.length === 0 ? (
                <span className="text-muted-foreground select-none text-sm">{placeholder}</span>
              ) : (
                <>
                  {displayedTags.map((opt) => (
                    <span
                      key={opt.value}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#E8F5EE] text-[#018752] border border-[#018752]/20 shrink-0 animate-in fade-in zoom-in-95 duration-150"
                    >
                      <span className="truncate max-w-[180px]">{opt.label}</span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveTag(opt.value, e)}
                        className="size-3.5 rounded-full hover:bg-[#018752]/15 inline-flex items-center justify-center transition-colors ml-0.5 text-[#018752]"
                        title={`Remove ${opt.label}`}
                      >
                        <X className="size-2.5 stroke-[2.5]" />
                      </button>
                    </span>
                  ))}

                  {hiddenCount > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-muted text-foreground border border-border shrink-0">
                      +{hiddenCount} more
                    </span>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
              {selectedOptions.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="p-1 rounded-md hover:bg-muted hover:text-foreground transition-colors"
                  title="Clear all"
                >
                  <X className="size-3.5" />
                </button>
              )}
              <ChevronDown
                className={cn(
                  "size-4 transition-transform duration-200 opacity-60",
                  open && "rotate-180 text-[#018752] opacity-100"
                )}
              />
            </div>
          </PopoverPrimitive.Trigger>

          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              align="start"
              sideOffset={6}
              className={cn(
                "z-[9999] w-[var(--radix-popover-trigger-width)] min-w-[280px] max-w-[500px] rounded-2xl border border-border bg-card p-0 text-card-foreground shadow-2xl outline-none",
                "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
              )}
            >
              {/* Search Bar */}
              <div className="p-3 border-b border-border/60 bg-muted/20">
                <div className="relative flex items-center">
                  <Search className="absolute left-3 size-4 text-muted-foreground opacity-60 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full h-9 pl-9 pr-8 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[#018752]/20 focus:border-[#018752] transition-colors"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>

                {/* Quick actions row */}
                <div className="flex items-center justify-between mt-2.5 px-0.5 text-xs">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-[#018752] hover:text-[#016f43] font-semibold text-[11px] transition-colors"
                  >
                    {isAllSelected ? "Deselect All" : "Select All"}
                  </button>
                  <span className="text-[11px] text-muted-foreground">
                    {value.length} of {options.length} selected
                  </span>
                </div>
              </div>

              {/* Options list */}
              <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin scrollbar-thumb-muted">
                {filteredOptions.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    No options found
                  </div>
                ) : (
                  filteredOptions.map((opt) => {
                    const isSelected = value.includes(opt.value);
                    return (
                      <div
                        key={opt.value}
                        onClick={(e) => handleToggle(opt.value, e)}
                        className={cn(
                          "flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-xs font-medium transition-all select-none",
                          isSelected
                            ? "bg-[#E8F5EE] text-[#018752] font-semibold"
                            : "text-foreground hover:bg-muted/60"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Checkbox box */}
                          <div
                            className={cn(
                              "size-4 rounded-md flex items-center justify-center border transition-all shrink-0",
                              isSelected
                                ? "bg-[#018752] border-[#018752] text-white shadow-sm"
                                : "border-border bg-background"
                            )}
                          >
                            {isSelected && <Check className="size-3 stroke-[3]" />}
                          </div>

                          <div className="flex flex-col min-w-0">
                            <span className="truncate">{opt.label}</span>
                            {opt.description && (
                              <span className="text-[10px] text-muted-foreground font-normal truncate">
                                {opt.description}
                              </span>
                            )}
                          </div>
                        </div>

                        {opt.badge && (
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-md text-[10px] font-mono shrink-0",
                              isSelected
                                ? "bg-[#018752]/15 text-[#018752]"
                                : "bg-muted text-muted-foreground border border-border/50"
                            )}
                          >
                            {opt.badge}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-2 border-t border-border/60 bg-muted/10 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground px-2">
                  {value.length === 0 ? "None selected" : `${value.length} selected`}
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-3 py-1 text-xs font-semibold bg-[#018752] text-white rounded-lg hover:bg-[#016f43] transition-colors"
                >
                  Done
                </button>
              </div>
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </div>
      </PopoverPrimitive.Root>
    );
  }
);

MultiSelect.displayName = "MultiSelect";
