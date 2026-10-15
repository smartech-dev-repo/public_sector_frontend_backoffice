"use client";

import React, { useRef, useEffect } from 'react';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export default function OtpInput({
  length = 6,
  value = '',
  onChange,
  disabled = false,
  autoFocus = true,
  className = ''
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Split value into array of single characters
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    // Keep only numbers
    const cleaned = rawVal.replace(/\D/g, '');

    if (!cleaned) {
      // User erased
      const newDigits = [...digits];
      newDigits[index] = '';
      onChange(newDigits.join(''));
      return;
    }

    if (cleaned.length === 1) {
      const newDigits = [...digits];
      newDigits[index] = cleaned;
      onChange(newDigits.join(''));

      // Move to next box
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    } else {
      // Multiple digits entered (e.g. mobile auto-fill or fast input)
      handleMultipleDigits(cleaned, index);
    }
  };

  const handleMultipleDigits = (pasted: string, startIndex: number = 0) => {
    const cleanNumbers = pasted.replace(/\D/g, '');
    if (!cleanNumbers) return;

    const newDigits = [...digits];
    for (let i = 0; i < cleanNumbers.length && startIndex + i < length; i++) {
      newDigits[startIndex + i] = cleanNumbers[i];
    }
    const combined = newDigits.join('');
    onChange(combined);

    const nextIndex = Math.min(startIndex + cleanNumbers.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Current is empty, delete previous and move back
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        inputRefs.current[index - 1]?.focus();
        e.preventDefault();
      } else if (digits[index]) {
        // Clear current
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join(''));
        e.preventDefault();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    handleMultipleDigits(pastedData, 0);
  };

  return (
    <div className={`flex items-center justify-center gap-2 sm:gap-3 ${className}`}>
      {Array.from({ length }).map((_, index) => {
        const isFilled = Boolean(digits[index]);
        return (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            disabled={disabled}
            value={digits[index] || ''}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={`w-14 h-14 sm:w-13 sm:h-16 text-center font-mono text-xl sm:text-2xl font-extrabold rounded-2xl border-2 transition-all outline-none ${
              isFilled
                ? 'border-[#018752] bg-[#E8F5EE]/40 dark:bg-emerald-950/20 text-[#018752] dark:text-emerald-400 shadow-xs'
                : 'border-border/80 bg-background text-foreground hover:border-muted-foreground/40'
            } focus:border-[#018752] focus:ring-4 focus:ring-[#018752]/15 dark:focus:ring-emerald-500/20 focus:bg-background disabled:opacity-50 disabled:cursor-not-allowed`}
          />
        );
      })}
    </div>
  );
}
