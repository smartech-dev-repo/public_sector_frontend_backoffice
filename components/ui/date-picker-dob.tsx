"use client"

import * as React from "react"
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DatePickerDOBProps {
  className?: string;
  date?: string;
  onSelect?: (date: string) => void;
  fromYear?: number;
  toYear?: number;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function buildCalendarWeeks(displayMonth: Date): Date[][] {
  const start = startOfWeek(startOfMonth(displayMonth));
  const end = endOfWeek(endOfMonth(displayMonth));
  const weeks: Date[][] = [];
  let current = start;
  while (current <= end) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(current);
      current = addDays(current, 1);
    }
    weeks.push(week);
  }
  return weeks;
}

export function DatePickerDOB({
  className,
  date,
  onSelect,
  fromYear,
  toYear,
}: DatePickerDOBProps) {
  const currentYear = new Date().getFullYear();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    date ? new Date(date) : undefined
  );
  const [displayMonth, setDisplayMonth] = React.useState<Date>(
    date ? new Date(date) : new Date(currentYear - 30, 0)
  );

  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (date) {
      setSelectedDate(new Date(date));
      setDisplayMonth(new Date(date));
    } else {
      setSelectedDate(undefined);
    }
  }, [date]);

  const handleSelect = (day: Date) => {
    setSelectedDate(day);
    setDisplayMonth(day);
    if (onSelect) {
      onSelect(format(day, "yyyy-MM-dd"));
    }
    setIsOpen(false);
  };

  const handleMonthChange = (newMonthIdx: string) => {
    setDisplayMonth(new Date(displayMonth.getFullYear(), parseInt(newMonthIdx), 1));
  };

  const handleYearChange = (newYear: string) => {
    setDisplayMonth(new Date(parseInt(newYear), displayMonth.getMonth(), 1));
  };

  const years = React.useMemo(() => {
    const y = [];
    const maxYear = toYear ?? currentYear;
    const minYear = fromYear ?? 1900;
    for (let i = maxYear; i >= minYear; i--) y.push(i);
    return y;
  }, [currentYear, fromYear, toYear]);

  const weeks = buildCalendarWeeks(displayMonth);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex h-10 w-[240px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate text-base font-normal">
            {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Pick a date"}
          </span>
          {selectedDate ? (
            <X 
              className="h-4 w-4 opacity-50 hover:opacity-100 cursor-pointer" 
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setSelectedDate(undefined);
                if (onSelect) onSelect("");
              }} 
            />
          ) : (
            <CalendarIcon className="h-5 w-5 opacity-50" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-5 rounded-3xl border-border/50" align="start">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <h3 className="font-semibold text-2xl text-foreground">Select Date</h3>
          <div className="flex flex-col items-center border-[2px] border-[#1a73e8] rounded-[0.5rem] overflow-hidden w-[3.25rem] bg-card shrink-0 mt-1">
            <div className="bg-[#1a73e8] w-full h-[14px] flex justify-evenly items-center pt-0.5 px-0.5">
              <div className="w-[2.5px] h-2 bg-card rounded-full" />
              <div className="w-[2.5px] h-2 bg-card rounded-full" />
              <div className="w-[2.5px] h-2 bg-card rounded-full" />
              <div className="w-[2.5px] h-2 bg-card rounded-full" />
            </div>
            <div className="py-1.5 font-bold text-[#1a73e8] text-[1.3rem] leading-none">
              {selectedDate ? format(selectedDate, "dd") : "15"}
            </div>
          </div>
        </div>

        {/* Month/Year selects */}
        <div className="flex gap-2 mb-4">
          <Select value={displayMonth.getMonth().toString()} onValueChange={handleMonthChange}>
            <SelectTrigger className="bg-muted hover:bg-muted/80 text-foreground border-0 h-10 px-4 font-bold text-base focus:ring-0 w-fit rounded-[0.5rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={i} value={i.toString()}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={displayMonth.getFullYear().toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="bg-muted hover:bg-muted/80 text-foreground border-0 h-10 px-4 font-bold text-base focus:ring-0 w-fit rounded-[0.5rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Calendar grid — built manually, no DayPicker classNames */}
        <div className="w-full">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className={cn(
                  "text-center text-[0.75rem] font-semibold py-1",
                  day === "SUN" ? "text-[#1a73e8]" : "text-foreground/70"
                )}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day rows */}
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map((day, di) => {
                const isCurrentMonth = isSameMonth(day, displayMonth);
                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                const isToday = isSameDay(day, new Date());

                return (
                  <div key={di} className="flex items-center justify-center h-10">
                    <button
                      onClick={() => handleSelect(day)}
                      className={cn(
                        "h-9 w-9 rounded-full text-sm font-medium transition-colors flex items-center justify-center",
                        !isCurrentMonth && "text-muted-foreground opacity-30",
                        isCurrentMonth && !isSelected && "text-foreground hover:bg-muted",
                        isToday && !isSelected && "text-[#1a73e8] font-bold",
                        isSelected && "text-[#1a73e8] font-bold underline underline-offset-2 bg-transparent hover:bg-muted"
                      )}
                    >
                      {format(day, "dd")}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}