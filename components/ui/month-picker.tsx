import * as React from 'react';
import { format, parse, getYear, getMonth, setYear, setMonth } from 'date-fns';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface MonthPickerProps {
  value?: string; // Format: YYYY-MM
  onChange: (value: string) => void;
  placeholder?: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function MonthPicker({ value, onChange, placeholder = 'Select period' }: MonthPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [currentYear, setCurrentYear] = React.useState<number>(new Date().getFullYear());

  React.useEffect(() => {
    if (value) {
      const parsed = parse(value, 'yyyy-MM', new Date());
      if (!isNaN(parsed.getTime())) {
        setCurrentYear(getYear(parsed));
      }
    }
  }, [value, open]);

  const selectedMonthIndex = React.useMemo(() => {
    if (!value) return -1;
    const parsed = parse(value, 'yyyy-MM', new Date());
    if (isNaN(parsed.getTime())) return -1;
    if (getYear(parsed) !== currentYear) return -1;
    return getMonth(parsed);
  }, [value, currentYear]);

  const handleMonthSelect = (monthIdx: number) => {
    const newDate = setMonth(setYear(new Date(), currentYear), monthIdx);
    onChange(format(newDate, 'yyyy-MM'));
    setOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setOpen(false);
  };

  const handleThisMonth = () => {
    onChange(format(new Date(), 'yyyy-MM'));
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal h-8 px-3',
            !value && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">
            {value ? format(parse(value, 'yyyy-MM', new Date()), 'MMMM yyyy') : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-4" align="start">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between bg-slate-900 text-slate-50 p-2 rounded-md">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-800 hover:text-slate-50 text-slate-400" onClick={() => setCurrentYear(y => y - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium text-sm">{currentYear}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-800 hover:text-slate-50 text-slate-400" onClick={() => setCurrentYear(y => y + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {MONTHS.map((m, i) => {
              const isSelected = selectedMonthIndex === i;
              return (
                <Button
                  key={m}
                  variant="ghost"
                  className={cn(
                    "h-10 w-full font-medium text-sm hover:bg-slate-100",
                    isSelected && "bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                  )}
                  onClick={() => handleMonthSelect(i)}
                >
                  {m}
                </Button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 text-sm font-normal hover:bg-emerald-50" onClick={handleClear}>
              Clear
            </Button>
            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 text-sm font-normal hover:bg-emerald-50" onClick={handleThisMonth}>
              This month
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
