import React from 'react';
import { Select as RadixSelect, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export interface SelectSharedProps {
  options?: { label: string; value: string }[];
  value?: string;
  onChange?: (val: any) => void;
  placeholder?: string;
  className?: string;
}

export default function Select({ options, value, onChange, placeholder, className }: SelectSharedProps) {
  return (
    <RadixSelect value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options?.map((opt, i) => (
          <SelectItem key={i} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </RadixSelect>
  );
}
