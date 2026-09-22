import React from 'react';

interface PulseLoaderProps {
  rows?: number;
  className?: string;
}

export default function PulseLoader({ rows = 5, className = '' }: PulseLoaderProps) {
  return (
    <div className={`p-8 space-y-4 w-full animate-pulse ${className}`}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 bg-muted rounded-lg w-48"></div>
        <div className="h-9 bg-muted rounded-lg w-32"></div>
      </div>
      {/* Filter bar skeleton */}
      <div className="flex gap-3">
        <div className="h-10 bg-muted rounded-xl w-64"></div>
        <div className="h-10 bg-muted rounded-xl w-40"></div>
        <div className="h-10 bg-muted rounded-xl w-40"></div>
      </div>
      {/* Table header skeleton */}
      <div className="h-12 bg-muted/80 rounded-xl w-full"></div>
      {/* Table rows skeleton */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 bg-muted/50 rounded-xl w-full" style={{ opacity: 1 - (i * 0.15) }}></div>
      ))}
    </div>
  );
}
