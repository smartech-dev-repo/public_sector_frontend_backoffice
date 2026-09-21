import React, { useState, useRef, useId, forwardRef, useImperativeHandle } from 'react';

export interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  type?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(({
  value,
  onChange,
  label,
  placeholder = '',
  type = 'text',
  disabled = false,
  readOnly = false,
  ...rest
}, ref) => {
  const internalId = useId();
  const id = rest.id || `auth-input-${internalId}`;
  
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const innerRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

  const computedType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  const focusInput = () => {
    if (!disabled) {
      innerRef.current?.focus();
    }
  };

  return (
    <div
      className={`relative border rounded-xl px-4 py-2 bg-white transition-colors flex items-center justify-between ${
        isFocused ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-200'
      } ${
        disabled ? 'opacity-60 bg-slate-50' : 'hover:border-emerald-300'
      }`}
      onClick={focusInput}
    >
      <div className="flex-1 overflow-hidden">
        <label htmlFor={id} className="block text-xs text-slate-500 mb-0.5 pointer-events-none whitespace-nowrap overflow-hidden text-ellipsis">
          {label}
        </label>
        <input
          id={id}
          ref={innerRef}
          type={computedType}
          value={value}
          placeholder={placeholder}
          readOnly={readOnly}
          disabled={disabled}
          className="w-full bg-transparent text-[15px] font-medium text-slate-900 placeholder:text-slate-300 outline-none p-0"
          onChange={onChange}
          onFocus={(e) => { setIsFocused(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setIsFocused(false); rest.onBlur?.(e); }}
          {...rest}
        />
      </div>
      {type === 'password' && (
        <div 
          className="ml-2 flex-shrink-0 cursor-pointer text-slate-400 hover:text-slate-600 transition-colors" 
          onClick={(e) => { e.stopPropagation(); setShowPassword(!showPassword); }}
        >
          {!showPassword ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
            </svg>
          )}
        </div>
      )}
    </div>
  );
});

AuthInput.displayName = 'AuthInput';

export default AuthInput;
