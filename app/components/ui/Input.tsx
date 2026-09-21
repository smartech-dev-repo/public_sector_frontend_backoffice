import React, { useMemo } from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement> | any) => void;
  label?: string;
  type?: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  icon?: React.ReactNode;
}

export default function Input({
  value = '',
  onChange,
  label = '',
  type = 'text',
  placeholder = '',
  hint = '',
  required = false,
  icon,
  ...rest
}: InputProps) {
  const formattedValue = useMemo(() => {
    if (type === 'money' && value) {
      const num = String(value).replace(/\D/g, '');
      return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return value;
  }, [type, value]);

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    let val = event.target.value;
    if (type === 'money') {
      val = val.replace(/\D/g, '');
    }
    
    if (onChange) {
      // Pass synthetic event or simply just update the value
      const newEvent = { ...event, target: { ...event.target, value: val } };
      onChange(newEvent as any);
    }
  };

  const hasIcon = Boolean(icon) || type === 'money';

  return (
    <div className="relative">
      {label && <label className="block text-sm text-slate-700 mb-1.5">{label}</label>}
      <div className="relative flex items-center">
        {hasIcon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none">
            {icon || (type === 'money' && <span className="text-sm font-medium">₦</span>)}
          </div>
        )}
        <input 
          type={type === 'money' ? 'text' : type} 
          value={formattedValue} 
          onChange={handleInput}
          placeholder={placeholder}
          required={required}
          className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-emerald-500 focus:bg-white ${hasIcon ? 'pl-8 pr-4' : 'px-4'}`}
          {...rest}
        />
      </div>
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
