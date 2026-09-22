import React, { useState, useId, forwardRef, useImperativeHandle, useRef } from 'react';

export interface CustomInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>, 'size' | 'prefix'> {
  label?: string;
  type?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  clearable?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  hint?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  showCount?: boolean;
  rows?: number;
  size?: 'sm' | 'md' | 'lg';
  containerClass?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  onEnter?: () => void;
  onClear?: () => void;
}

export const CustomInput = forwardRef<HTMLInputElement | HTMLTextAreaElement, CustomInputProps>(({
  value = '',
  onChange,
  label = '',
  placeholder = '',
  type = 'text',
  disabled = false,
  readOnly = false,
  required = false,
  clearable = false,
  hasError = false,
  errorMessage = '',
  hint = '',
  prefixIcon,
  suffixIcon,
  autoComplete = 'off',
  maxLength,
  showCount = false,
  rows = 4,
  size = 'md',
  containerClass = '',
  prefix,
  suffix,
  onEnter,
  onClear,
  onBlur,
  onFocus,
  ...rest
}, ref) => {
  const internalId = useId();
  const inputId = rest.id || `input-${internalId}`;
  
  const innerRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLInputElement | HTMLTextAreaElement);

  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const computedType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  const inputSizeClass = {
    sm: 'py-2.5 text-sm',
    lg: 'py-4.5 text-base',
    md: 'py-3.5 text-[15px]',
  }[size];

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      onEnter?.();
    }
  };

  const handleClear = () => {
    if (onChange) {
      const e = { target: { value: '' } } as React.ChangeEvent<HTMLInputElement>;
      onChange(e);
    }
    onClear?.();
  };

  const hasPrefix = Boolean(prefix || prefixIcon);
  const hasSuffix = Boolean(suffix || suffixIcon || type === 'password' || (clearable && value));
  
  const baseClasses = `peer w-full rounded-xl border bg-card px-4 text-[15px] font-medium text-foreground placeholder:text-muted-foreground placeholder:font-normal outline-none transition-all duration-200 ${inputSizeClass}`;
  
  const stateClasses = hasError 
    ? 'border-destructive bg-destructive/5 focus:border-destructive focus:ring-1 focus:ring-destructive' 
    : 'border-border hover:border-muted-foreground/30 focus:border-primary focus:bg-card';
    
  const paddingClasses = `${hasPrefix ? 'pl-12' : ''} ${hasSuffix ? 'pr-12' : ''}`;
  
  const stringValue = typeof value === 'string' ? value : String(value || '');

  return (
    <div className={`w-full ${containerClass}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-foreground mb-2 tracking-wide">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
      )}

      <div className={`relative group ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
        {hasPrefix && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200 z-10">
            {prefix || (prefixIcon && <span className="text-lg">{prefixIcon}</span>)}
          </div>
        )}

        {type !== 'textarea' ? (
          <input
            id={inputId}
            ref={innerRef as React.RefObject<HTMLInputElement>}
            type={computedType}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            autoComplete={autoComplete}
            maxLength={maxLength}
            className={`${baseClasses} ${stateClasses} ${paddingClasses}`}
            onChange={handleChange}
            onFocus={(e) => { setIsFocused(true); onFocus?.(e); }}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            {...rest}
          />
        ) : (
          <textarea
            id={inputId}
            ref={innerRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            rows={rows}
            maxLength={maxLength}
            className={`peer w-full rounded-xl border bg-card px-4 py-3 text-[15px] font-medium text-foreground placeholder:text-muted-foreground placeholder:font-normal outline-none transition-all duration-200 resize-none ${stateClasses}`}
            onChange={handleChange}
            onFocus={(e) => { setIsFocused(true); onFocus?.(e); }}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            {...(rest as any)}
          />
        )}

        {hasSuffix && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
            {clearable && value && (
              <button
                type="button"
                className="w-5 h-5 flex items-center justify-center rounded-full bg-muted hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground transition-all duration-150"
                onClick={handleClear}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {type === 'password' && (
              <button
                type="button"
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
                onClick={() => setShowPassword(!showPassword)}
              >
                {!showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            )}

            {suffix || (suffixIcon && <span className="text-muted-foreground text-lg">{suffixIcon}</span>)}
          </div>
        )}
      </div>

      {(hasError || hint || (maxLength && showCount)) && (
        <div className="flex items-start justify-between mt-1">
          <div className="flex-1">
            {hasError && errorMessage ? (
              <p className="text-xs font-medium text-destructive flex items-center gap-1">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errorMessage}
              </p>
            ) : hint ? (
              <p className="text-xs text-muted-foreground">{hint}</p>
            ) : null}
          </div>
          {maxLength && showCount && (
            <span className="text-xs text-muted-foreground ml-2 tabular-nums">
              {stringValue.length}/{maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

CustomInput.displayName = 'CustomInput';

export default CustomInput;
