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
}

export default function Select({
  value,
  onChange,
  label = '',
  options,
  placeholder = '',
  icon,
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
    <div className="relative" ref={containerRef}>
      {label && <label className="block text-sm text-slate-700 mb-1.5">{label}</label>}
      <div className="relative flex items-center" onClick={() => setIsOpen(!isOpen)}>
        {icon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
        <div 
          className={`w-full bg-slate-50 border rounded-xl py-2.5 text-sm outline-none transition-all cursor-pointer flex items-center justify-between ${
            isOpen ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/20' : 'border-slate-200'
          } ${icon ? 'pl-10 pr-10' : 'pl-4 pr-10'} ${
            selectedOption ? 'text-slate-800' : 'text-slate-400'
          }`}
        >
          <span>{selectedOption ? selectedOption.label : (placeholder || 'Select...')}</span>
          <div className={`absolute right-3 text-slate-400 pointer-events-none transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 origin-top-right bg-white border border-slate-100 rounded-xl shadow-xl outline-none overflow-hidden max-h-60 overflow-y-auto animate-dropdown-fade">
          <div className="py-1">
            {placeholder && (
              <div className="px-4 py-2 text-sm text-slate-400 cursor-default">
                {placeholder}
              </div>
            )}
            {options.map((opt) => (
              <button 
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                type="button"
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                  opt.value === value ? 'bg-emerald-50/50 text-emerald-700 font-medium' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt.label}
                {opt.value === value && (
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dropdown-fade {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-dropdown-fade {
          animation: dropdown-fade 0.1s ease-out;
        }
      `}} />
    </div>
  );
}
