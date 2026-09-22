import React from 'react';

export default function PulseLoader() {
  return (
    <div className="p-8 space-y-4 w-full animate-pulse">
      <div className="h-10 bg-slate-200 rounded-lg w-full"></div>
      <div className="h-10 bg-slate-100 rounded-lg w-full"></div>
      <div className="h-10 bg-slate-50 rounded-lg w-full"></div>
      <div className="h-10 bg-slate-50 rounded-lg w-full"></div>
      <div className="h-10 bg-slate-50 rounded-lg w-full"></div>
    </div>
  );
}
