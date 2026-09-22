import * as React from 'react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';

interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

export function TimePicker({ value, onChange, className, disabled }: TimePickerProps) {
  const [hour, minute] = React.useMemo(() => {
    if (!value) return ['', ''];
    const parts = value.split(':');
    return [parts[0] || '', parts[1] || ''];
  }, [value]);

  const handleChange = (field: 'hour' | 'minute', v: string) => {
    const newHour = field === 'hour' ? v : hour;
    const newMinute = field === 'minute' ? v : minute;
    if (newHour && newMinute) {
      onChange?.(`${newHour}:${newMinute}`);
    } else if (newHour) {
      onChange?.(`${newHour}:00`);
    } else if (newMinute) {
      onChange?.(`00:${newMinute}`);
    }
  };

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
      <Select value={hour} onValueChange={(v: string) => handleChange('hour', v)} disabled={disabled}>
        <SelectTrigger className="h-9 w-[72px] px-2">
          <SelectValue placeholder="HH" />
        </SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {HOURS.map((h) => (
            <SelectItem key={h} value={h}>{h}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-sm font-semibold text-muted-foreground">:</span>
      <Select value={minute} onValueChange={(v: string) => handleChange('minute', v)} disabled={disabled}>
        <SelectTrigger className="h-9 w-[72px] px-2">
          <SelectValue placeholder="MM" />
        </SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {MINUTES.map((m) => (
            <SelectItem key={m} value={m}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
