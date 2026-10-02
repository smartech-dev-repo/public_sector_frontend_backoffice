"use client"

import * as React from "react"
import { format, parse, isValid } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/app/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover"

interface MonthPickerProps {
  value: string; // Format: "YYYY-MM"
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export function MonthPicker({
  value,
  onChange,
  placeholder = "Pick a month",
  className,
}: MonthPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());

  React.useEffect(() => {
    if (value) {
      const date = parse(value, 'yyyy-MM', new Date());
      if (isValid(date)) {
        setCurrentYear(date.getFullYear());
      }
    }
  }, [value, open]);

  const handleMonthSelect = (monthIndex: number) => {
    const selectedDate = new Date(currentYear, monthIndex, 1);
    const newValue = format(selectedDate, 'yyyy-MM');
    onChange(newValue);
    setOpen(false);
  };

  const selectedDate = value ? parse(value, 'yyyy-MM', new Date()) : null;
  const isSelectedValid = selectedDate && isValid(selectedDate);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal bg-card border-border h-10",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {isSelectedValid ? format(selectedDate, "MMM yyyy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <div className="p-3">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="outline" 
              className="h-7 w-7 p-0 bg-transparent" 
              onClick={() => setCurrentYear(y => y - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-medium text-sm">{currentYear}</div>
            <Button 
              variant="outline" 
              className="h-7 w-7 p-0 bg-transparent" 
              onClick={() => setCurrentYear(y => y + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {MONTHS.map((month, index) => {
              const isSelected = isSelectedValid && selectedDate.getFullYear() === currentYear && selectedDate.getMonth() === index;
              return (
                <Button
                  key={month}
                  variant={isSelected ? "primary" : "ghost"}
                  className={cn(
                    "h-9 w-full text-sm font-normal",
                    isSelected ? "bg-emerald-600 text-white hover:bg-emerald-700" : "hover:bg-muted/50"
                  )}
                  onClick={() => handleMonthSelect(index)}
                >
                  {month}
                </Button>
              );
            })}
          </div>
          
          <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const now = new Date();
                onChange(format(now, 'yyyy-MM'));
                setOpen(false);
              }}
              className="text-xs h-7 px-2 text-emerald-600 hover:text-emerald-700"
            >
              This month
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
