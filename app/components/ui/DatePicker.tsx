import React, { useMemo } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/light.css'; // use light theme, we'll override it below
import { Calendar, X } from 'lucide-react';

interface DatePickerProps {
  value?: Date | Date[] | string;
  onChange?: (dates: Date[]) => void;
  placeholder?: string;
  mode?: 'single' | 'multiple' | 'range';
}

export default function DatePicker({
  value,
  onChange,
  placeholder = 'Select date range...',
  mode = 'range'
}: DatePickerProps) {
  const config = useMemo(() => ({
    mode,
    dateFormat: 'd M Y',
    altInput: true,
    altFormat: 'd M Y',
    allowInput: false,
  }), [mode]);

  const handleClear = () => {
    onChange?.([]);
  };

  return (
    <div className="relative w-full">
      <Flatpickr
        value={value}
        onChange={(dates) => onChange?.(dates)}
        options={config as any}
        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors shadow-sm cursor-pointer placeholder-slate-400 pl-9"
        placeholder={placeholder}
      />
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <Calendar className="w-4 h-4" />
      </div>
      {/* Clear button */}
      {value && (Array.isArray(value) ? value.length > 0 : String(value).length > 0) && (
        <button 
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          type="button"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        .flatpickr-day.selected, .flatpickr-day.startRange, .flatpickr-day.endRange, .flatpickr-day.selected.inRange, .flatpickr-day.startRange.inRange, .flatpickr-day.endRange.inRange, .flatpickr-day.selected:focus, .flatpickr-day.startRange:focus, .flatpickr-day.endRange:focus, .flatpickr-day.selected:hover, .flatpickr-day.startRange:hover, .flatpickr-day.endRange:hover, .flatpickr-day.selected.prevMonthDay, .flatpickr-day.startRange.prevMonthDay, .flatpickr-day.endRange.prevMonthDay, .flatpickr-day.selected.nextMonthDay, .flatpickr-day.startRange.nextMonthDay, .flatpickr-day.endRange.nextMonthDay {
            background: #059669; /* emerald-600 */
            border-color: #059669;
        }
      `}} />
    </div>
  );
}
