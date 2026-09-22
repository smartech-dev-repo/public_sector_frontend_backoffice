"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { CustomCalendar } from "@/components/ui/custom-calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  className?: string;
  date?: string;
  onSelect?: (date: string) => void;
  disabled?: (date: Date) => boolean;
}

export function DatePicker({
  className,
  date,
  onSelect,
  disabled,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    date ? new Date(date) : undefined
  )

  React.useEffect(() => {
    setSelectedDate(date ? new Date(date) : undefined)
  }, [date])

  const handleSelect = (newDate: any) => {
    setSelectedDate(newDate)
    if (onSelect) {
      onSelect(newDate ? format(newDate, "yyyy-MM-dd") : "")
    }
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex h-10 w-[240px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
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
                handleSelect(undefined);
              }} 
            />
          ) : (
            <CalendarIcon className="h-5 w-5 opacity-50" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CustomCalendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  )
}
