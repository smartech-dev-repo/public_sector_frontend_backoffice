import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronDown, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, subMonths, endOfMonth, startOfQuarter, subQuarters, endOfQuarter, isSameDay } from 'date-fns';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

interface CustomDateRangePickerProps {
  value: string; // 'YYYY-MM-DD to YYYY-MM-DD'
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function CustomDateRangePicker({ value, onChange, placeholder = 'Select date range...' }: CustomDateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [date, setDate] = useState<DateRange | undefined>(() => {
    if (value) {
      const parts = value.split(' to ');
      if (parts.length === 2) {
        return {
          from: new Date(parts[0]),
          to: new Date(parts[1])
        };
      }
    }
    return undefined;
  });

  useEffect(() => {
    if (value) {
      const parts = value.split(' to ');
      if (parts.length === 2) {
        setDate({
          from: new Date(parts[0]),
          to: new Date(parts[1])
        });
      }
    } else {
      setDate(undefined);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range);
    if (range?.from && range?.to) {
       onChange(`${format(range.from, 'yyyy-MM-dd')} to ${format(range.to, 'yyyy-MM-dd')}`);
    } else if (range?.from) {
       onChange(`${format(range.from, 'yyyy-MM-dd')} to ${format(range.from, 'yyyy-MM-dd')}`);
    } else {
       onChange('');
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDate(undefined);
    onChange('');
  };

  const displayValue = date?.from ? (
    date.to && !isSameDay(date.from, date.to) ? 
      `${format(date.from, 'd MMM yy')} - ${format(date.to, 'd MMM yy')}` : 
      format(date.from, 'd MMM yy')
  ) : '';

  const presets = [
    { label: 'Today', getValue: () => ({ from: new Date(), to: new Date() }) },
    { label: 'Yesterday', getValue: () => ({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) }) },
    { label: 'Last week', getValue: () => ({ from: startOfWeek(subDays(new Date(), 7)), to: endOfWeek(subDays(new Date(), 7)) }) },
    { label: 'Last month', getValue: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
    { label: 'Last quarter', getValue: () => ({ from: startOfQuarter(subQuarters(new Date(), 1)), to: endOfQuarter(subQuarters(new Date(), 1)) }) },
  ];

  const handlePreset = (getValue: () => {from: Date, to: Date}) => {
    const range = getValue();
    handleSelect(range);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block w-full" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm text-slate-700 hover:border-emerald-400 focus:outline-none transition-colors shadow-sm cursor-pointer flex items-center justify-between gap-2 group w-full"
      >
        <span className={displayValue ? 'text-slate-900 font-medium' : 'text-slate-400'}>
          {displayValue || placeholder}
        </span>
        {value ? (
          <button onClick={handleClear} className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-slate-100 shadow-xl rounded-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-100 flex flex-col sm:flex-row gap-4 sm:gap-6 w-[280px] sm:w-[500px]">
          
          {/* Sidebar */}
          <div className="flex flex-col gap-1 pr-4 sm:border-r border-slate-100 w-full sm:w-40 shrink-0">
            {presets.map(preset => (
              <button 
                key={preset.label}
                onClick={() => handlePreset(preset.getValue)}
                className="text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-colors"
              >
                {preset.label}
              </button>
            ))}
            <div className="flex-grow"></div>
            <button 
                onClick={handleClear}
                className="text-left px-3 py-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors mt-4 sm:mt-0"
              >
                Reset
            </button>
          </div>

          {/* Calendar */}
          <div className="calendar-wrapper flex-grow flex justify-center">
             <DayPicker
              mode="range"
              selected={date}
              onSelect={handleSelect}
              showOutsideDays
              className="border-0 p-0 m-0"
            />
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .calendar-wrapper .rdp {
          --rdp-cell-size: 36px;
          --rdp-accent-color: #10b981; /* emerald-500 */
          --rdp-background-color: #d1fae5; /* emerald-100 */
          margin: 0;
        }
        .calendar-wrapper .rdp-day_selected {
          font-weight: bold;
        }
        .calendar-wrapper .rdp-day_range_start:not(.rdp-day_range_end) {
          background-color: #10b981;
          color: white;
          border-radius: 50%;
          position: relative;
        }
        .calendar-wrapper .rdp-day_range_start:not(.rdp-day_range_end)::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          right: -2px;
          background-color: #d1fae5;
          z-index: -1;
        }
        .calendar-wrapper .rdp-day_range_end:not(.rdp-day_range_start) {
          background-color: #10b981;
          color: white;
          border-radius: 50%;
          position: relative;
        }
        .calendar-wrapper .rdp-day_range_end:not(.rdp-day_range_start)::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          right: 50%;
          left: -2px;
          background-color: #d1fae5;
          z-index: -1;
        }
        .calendar-wrapper .rdp-day_range_middle {
          background-color: #d1fae5;
          color: #064e3b;
          border-radius: 0;
        }
        .calendar-wrapper .rdp-caption_label {
          font-weight: 600;
          color: #1e293b;
        }
        .calendar-wrapper .rdp-head_cell {
          color: #64748b;
          font-weight: 400;
          text-transform: capitalize;
        }
      `}} />
    </div>
  );
}
