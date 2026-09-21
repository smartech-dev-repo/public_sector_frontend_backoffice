"use client";

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      // Focus input on open
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  if (!mounted) return null;
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xl animate-fade-in-down duration-200">
        
        {/* Search Input Header */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100">
          <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input 
            ref={inputRef}
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search loans, agents, logs..." 
            className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-slate-800 placeholder:text-slate-400 font-medium text-lg"
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 bg-slate-50">ESC</span>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Search Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 bg-slate-50/50">
          
          {/* Empty State */}
          {!searchQuery ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <p className="text-slate-500 font-medium">Type to start searching across the portal.</p>
            </div>
          ) : (
            /* Mock Results */
            <div className="space-y-6">
              {/* Loan Results */}
              <div>
                <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-3 px-2">Loan Applications (2)</h3>
                <div className="space-y-1">
                  <button className="w-full flex items-center justify-between px-3 py-3 hover:bg-emerald-50 rounded-xl group transition-colors text-left border border-transparent hover:border-emerald-100">
                    <div>
                      <div className="text-slate-700 group-hover:text-emerald-700">Emmanuel Doe</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">APP-1001 • Pending Review</div>
                    </div>
                    <svg className="w-4 h-4 text-slate-300 group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </button>
                  <button className="w-full flex items-center justify-between px-3 py-3 hover:bg-emerald-50 rounded-xl group transition-colors text-left border border-transparent hover:border-emerald-100">
                    <div>
                      <div className="text-slate-700 group-hover:text-emerald-700">Aisha Bello</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">APP-1002 • Approved</div>
                    </div>
                    <svg className="w-4 h-4 text-slate-300 group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </button>
                </div>
              </div>

              {/* Agent Results */}
              <div>
                <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-3 px-2">Agents (1)</h3>
                <div className="space-y-1">
                  <button className="w-full flex items-center justify-between px-3 py-3 hover:bg-emerald-50 rounded-xl group transition-colors text-left border border-transparent hover:border-emerald-100">
                    <div>
                      <div className="text-slate-700 group-hover:text-emerald-700">John Doe</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">AGT-9901 • Suspended</div>
                    </div>
                    <svg className="w-4 h-4 text-slate-300 group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.2s ease;
        }
      `}} />
    </div>,
    document.body
  );
}
