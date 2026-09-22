"use client"

import * as React from "react"
import { format, differenceInDays } from "date-fns"
import { Calendar as CalendarIcon, ArrowRight, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CustomCalendar, type DateRange } from "@/components/ui/custom-calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerWithRangeProps {
  className?: string;
  from?: string;
  to?: string;
  onSelect?: (range: { from: string; to: string }) => void;
}

export function DatePickerWithRange({
  className,
  from,
  to,
  onSelect,
}: DatePickerWithRangeProps) {
  const [open, setOpen] = React.useState(false);
  const [tempDate, setTempDate] = React.useState<DateRange | undefined>({
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
  });

  const committedDate = React.useMemo(() => {
    return {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    }
  }, [from, to])

  // Reset temp state when opening popover
  React.useEffect(() => {
    if (open) {
      setTempDate(committedDate);
    }
  }, [open, committedDate]);

  const handleApply = () => {
    if (onSelect) {
      onSelect({
        from: tempDate?.from ? format(tempDate.from, "yyyy-MM-dd") : "",
        to: tempDate?.to ? format(tempDate.to, "yyyy-MM-dd") : "",
      })
    }
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const diffDays = (tempDate?.from && tempDate?.to) ? differenceInDays(tempDate.to, tempDate.from) : null;

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id="date"
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              !committedDate?.from && "text-muted-foreground"
            )}
          >
            <span className="truncate text-base font-normal">
              {committedDate?.from ? (
                committedDate.to ? (
                  `${format(committedDate.from, "M/d/yyyy")} - ${format(committedDate.to, "M/d/yyyy")}`
                ) : (
                  format(committedDate.from, "M/d/yyyy")
                )
              ) : (
                "Pick a date range"
              )}
            </span>
            {committedDate?.from ? (
              <X 
                className="h-4 w-4 opacity-50 hover:opacity-100 cursor-pointer" 
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (onSelect) {
                    onSelect({ from: "", to: "" });
                  }
                }} 
              />
            ) : (
              <CalendarIcon className="h-5 w-5 opacity-50" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col min-w-[550px]">
            {/* Header section matching the design */}
            <div className="flex items-center justify-between px-3 md:px-6 py-4 border-b bg-muted/20">
              <div className="flex-1 text-center font-medium text-lg">
                {tempDate?.from ? format(tempDate.from, "MMM dd, yyyy") : "Start Date"}
              </div>
              <div className="flex flex-col items-center justify-center text-muted-foreground px-4">
                <ArrowRight className="h-4 w-4 mb-1" />
                <span className="text-xs">{diffDays !== null ? `${diffDays} Days` : "-"}</span>
              </div>
              <div className="flex-1 text-center font-medium text-lg">
                {tempDate?.to ? format(tempDate.to, "MMM dd, yyyy") : "End Date"}
              </div>
            </div>

            {/* Calendar section */}
            <div className="border-b">
              <CustomCalendar
                mode="range"
                defaultMonth={tempDate?.from || new Date()}
                selected={tempDate}
                onSelect={(range) => setTempDate(range)}
                numberOfMonths={2}
              />
            </div>

            {/* Footer section */}
            <div className="flex justify-end items-center px-4 py-3 gap-2 bg-muted/10">
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleApply} disabled={!tempDate?.from || !tempDate?.to} className="bg-blue-600 hover:bg-blue-700 text-white">Apply</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
