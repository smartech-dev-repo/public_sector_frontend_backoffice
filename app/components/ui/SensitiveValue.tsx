"use client";

import { useState } from 'react';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';

interface SensitiveValueProps {
  value?: string | number | null;
  visibleCount?: number;
  className?: string;
  allowCopy?: boolean;
  forceRevealed?: boolean;
}

export default function SensitiveValue({
  value,
  visibleCount = 4,
  className = '',
  allowCopy = false,
  forceRevealed
}: SensitiveValueProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (value === null || value === undefined || value === '' || value === '—' || value === '--') {
    return <span className="text-muted-foreground font-sans">—</span>;
  }

  // Clean leading or trailing single/double quotes often present in payroll accounts
  const cleanStr = String(value).replace(/^['"]+|['"]+$/g, '').trim();
  if (!cleanStr) {
    return <span className="text-muted-foreground font-sans">—</span>;
  }

  const effectiveRevealed = forceRevealed !== undefined ? forceRevealed : isRevealed;

  // Mask string: pad prefix with bullet dots, preserve last N characters
  const getMaskedText = (str: string, keep: number) => {
    if (str.length <= keep) {
      return '••••';
    }
    const maskedLength = Math.max(str.length - keep, 4);
    const maskedPart = '•'.repeat(maskedLength);
    const visiblePart = str.slice(-keep);
    return `${maskedPart} ${visiblePart}`;
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(cleanStr);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono select-none ${className}`}>
      <span className="tracking-wide">
        {effectiveRevealed ? cleanStr : getMaskedText(cleanStr, visibleCount)}
      </span>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsRevealed((prev) => !prev);
        }}
        className="p-1 rounded-md text-muted-foreground/70 hover:text-foreground hover:bg-muted/60 transition-colors focus:outline-none"
        title={effectiveRevealed ? 'Hide sensitive data' : 'Reveal sensitive data'}
        aria-label={effectiveRevealed ? 'Hide sensitive data' : 'Reveal sensitive data'}
      >
        {effectiveRevealed ? (
          <EyeOff className="size-3.5 text-muted-foreground hover:text-foreground" />
        ) : (
          <Eye className="size-3.5 text-muted-foreground hover:text-foreground" />
        )}
      </button>

      {allowCopy && (
        <button
          type="button"
          onClick={handleCopy}
          className="p-1 rounded-md text-muted-foreground/70 hover:text-foreground hover:bg-muted/60 transition-colors focus:outline-none"
          title="Copy to clipboard"
          aria-label="Copy to clipboard"
        >
          {copied ? (
            <Check className="size-3.5 text-emerald-600" />
          ) : (
            <Copy className="size-3.5 text-muted-foreground hover:text-foreground" />
          )}
        </button>
      )}
    </span>
  );
}
