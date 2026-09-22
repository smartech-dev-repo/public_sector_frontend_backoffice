"use client";

import React, { useState, useEffect, useRef } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps {
  value?: string | number;
  onChange: (value: string | number) => void;
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

export default function Select({
  value,
  onChange,
  label = '',
  options,
  placeholder = '',
  icon,
  disabled = false,
  required = false,
  hasError = false,
  errorMessage = '',
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleSelect = (val: string | number) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="block text-sm font-semibold text-foreground mb-2 tracking-wide">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
      )}
      <div className={`relative flex items-center ${disabled ? 'opacity-60 pointer-events-none' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        {icon && (
          <div className="absolute left-4 text-muted-foreground pointer-events-none z-10">
            {icon}
          </div>
        )}
        <div 
          className={`w-full bg-card border rounded-xl py-3.5 text-[15px] font-medium outline-none transition-all cursor-pointer flex items-center justify-between ${
            hasError ? 'border-destructive bg-destructive/5' : isOpen ? 'border-primary bg-card ring-2 ring-primary/20' : 'border-border hover:border-muted-foreground/30'
          } ${icon ? 'pl-12 pr-10' : 'pl-4 pr-10'} ${
            selectedOption ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          <span>{selectedOption ? selectedOption.label : (placeholder || 'Select...')}</span>
          <div className={`absolute right-3 text-muted-foreground pointer-events-none transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      {hasError && errorMessage && (
        <p className="text-xs font-medium text-destructive flex items-center gap-1 mt-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {errorMessage}
        </p>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 origin-top-right bg-popover border border-border rounded-xl shadow-xl outline-none overflow-hidden max-h-60 overflow-y-auto animate-dropdown-fade">
          <div className="py-1">
            {placeholder && (
              <div className="px-4 py-2 text-sm text-muted-foreground cursor-default">
                {placeholder}
              </div>
            )}
            {options.map((opt) => (
              <button 
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                type="button"
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                  opt.value === value ? 'bg-primary/10 text-primary font-medium' : 'text-popover-foreground hover:bg-accent'
                }`}
              >
                {opt.label}
                {opt.value === value && (
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dropdown-fade {
          from { opacity: 0; transform: scale(0.95) translateY(-4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-dropdown-fade {
          animation: dropdown-fade 0.15s ease-out;
        }
      `}} />
    </div>
  );
}
