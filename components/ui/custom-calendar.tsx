"use client";

import { useState } from "react";
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  isAfter,
  isBefore,
  setMonth,
  setYear,
  getMonth,
  getYear,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type DateRange = {
  from: Date | undefined;
  to?: Date | undefined;
};

interface CalendarProps {
  mode?: "single" | "range";
  selected?: Date | DateRange | undefined;
  onSelect?: (date: any) => void;
  className?: string;
  defaultMonth?: Date;
  numberOfMonths?: number;
  disabled?: (date: Date) => boolean;
}

export function CustomCalendar({
  mode = "single",
  selected: externalSelected,
  onSelect,
  className,
  defaultMonth,
  numberOfMonths = 1,
  disabled,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(defaultMonth || new Date());
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const selected = externalSelected !== undefined 
    ? externalSelected 
    : (mode === "single" ? new Date() : { from: new Date(), to: new Date() });

  const handlePreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const onDateClick = (day: Date) => {
    if (mode === "single") {
      onSelect?.(day);
    } else if (mode === "range") {
      const range = (selected as DateRange) || { from: undefined, to: undefined };
      if (!range.from) {
        onSelect?.({ from: day, to: undefined });
      } else if (range.from && !range.to) {
        if (isBefore(day, range.from)) {
          onSelect?.({ from: day, to: undefined });
        } else {
          onSelect?.({ from: range.from, to: day });
        }
      } else if (range.from && range.to) {
        onSelect?.({ from: day, to: undefined });
      }
    }
  };

  const renderMonth = (monthDate: Date) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    const range = mode === "range" ? (selected as DateRange) : null;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;

        const isSelectedSingle = mode === "single" && selected && isSameDay(day, selected as Date);
        const isSelectedFrom = mode === "range" && range?.from && isSameDay(day, range.from);
        const isSelectedTo = mode === "range" && range?.to && isSameDay(day, range.to);
        const isWithinRange =
          mode === "range" &&
          range?.from &&
          range?.to &&
          isWithinInterval(day, { start: range.from, end: range.to });
        const isHoverRange =
          mode === "range" &&
          range?.from &&
          !range?.to &&
          hoverDate &&
          isAfter(hoverDate, range.from) &&
          isWithinInterval(day, { start: range.from, end: hoverDate });

        const isCurrentMonth = isSameMonth(day, monthStart);
        const isDisabled = disabled ? disabled(cloneDay) : false;

        days.push(
          <div
            key={day.toString()}
            className={cn(
              "p-0 relative w-9 h-9 flex items-center justify-center text-sm",
              !isCurrentMonth && !isDisabled && "text-muted-foreground opacity-40 cursor-pointer",
              !isCurrentMonth && isDisabled && "text-muted-foreground opacity-20",
              isCurrentMonth && isDisabled && "opacity-25 cursor-not-allowed line-through",
              !isDisabled && mode === "range" && (isWithinRange || isHoverRange) && "bg-accent",
              !isDisabled && mode === "range" && isSelectedFrom && "bg-accent rounded-l-md",
              !isDisabled && mode === "range" && isSelectedTo && "bg-accent rounded-r-md",
              !isDisabled && (isSelectedSingle || isSelectedFrom || isSelectedTo) && "bg-primary text-primary-foreground font-medium rounded-md",
              !isDisabled && !isSelectedSingle && !isSelectedFrom && !isSelectedTo && !(isWithinRange || isHoverRange) && "hover:bg-accent rounded-md cursor-pointer transition-colors"
            )}
            onClick={() => { if (!isDisabled) onDateClick(cloneDay); }}
            onMouseEnter={() => { if (!isDisabled) setHoverDate(cloneDay); }}
            onMouseLeave={() => { if (!isDisabled) setHoverDate(null); }}
          >
            <div className={cn(
              "w-9 h-9 flex items-center justify-center rounded-md",
              !isDisabled && "cursor-pointer",
              !isDisabled && (isSelectedSingle || isSelectedFrom || isSelectedTo) && "bg-primary text-primary-foreground hover:bg-primary",
              !isDisabled && mode === "range" && !isSelectedFrom && !isSelectedTo && (isWithinRange || isHoverRange) && "bg-transparent text-accent-foreground hover:bg-accent",
              !isDisabled && !isSelectedSingle && !isSelectedFrom && !isSelectedTo && !(isWithinRange || isHoverRange) && "hover:bg-accent text-foreground"
            )}>
              {formattedDate}
            </div>
          </div>
        );
        day = new Date(day.getTime() + 24 * 60 * 60 * 1000); // add 1 day
      }
      rows.push(
        <div className="flex w-full mt-2" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return rows;
  };

  const renderMonths = () => {
    const months = [];
    for (let i = 0; i < numberOfMonths; i++) {
      const monthDate = addMonths(currentMonth, i);
      months.push(
        <div key={i} className="space-y-4">
          <div className="flex justify-center pt-1 relative items-center gap-1 mx-8">
            <select
              className="h-7 rounded-md border border-input bg-transparent px-2 py-0 text-sm font-medium outline-none focus:ring-1 focus:ring-ring hover:bg-accent cursor-pointer"
              value={getMonth(monthDate)}
              onChange={(e) => {
                const m = parseInt(e.target.value, 10);
                const newDate = setMonth(monthDate, m);
                setCurrentMonth(subMonths(newDate, i));
              }}
            >
              {Array.from({ length: 12 }).map((_, mIdx) => (
                <option key={mIdx} value={mIdx}>
                  {format(new Date(2000, mIdx, 1), "MMMM")}
                </option>
              ))}
            </select>
            <select
              className="h-7 rounded-md border border-input bg-transparent px-2 py-0 text-sm font-medium outline-none focus:ring-1 focus:ring-ring hover:bg-accent cursor-pointer"
              value={getYear(monthDate)}
              onChange={(e) => {
                const y = parseInt(e.target.value, 10);
                const newDate = setYear(monthDate, y);
                setCurrentMonth(subMonths(newDate, i));
              }}
            >
              {Array.from({ length: 100 }).map((_, yIdx) => {
                const y = new Date().getFullYear() - 50 + yIdx;
                return (
                  <option key={y} value={y}>
                    {y}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="w-full border-collapse space-y-1">
            <div className="flex">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <div key={d} className="text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center">
                  {d}
                </div>
              ))}
            </div>
            {renderMonth(monthDate)}
          </div>
        </div>
      );
    }
    return months;
  };

  return (
    <div className={cn("p-3", className)}>
      <div className="flex justify-between items-center mb-4 px-1">
        <Button
          variant="outline"
          className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          onClick={handlePreviousMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          onClick={handleNextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0">
        {renderMonths()}
      </div>
    </div>
  );
}
