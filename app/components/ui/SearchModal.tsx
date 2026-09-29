"use client";

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { User, Folder, Settings, UserPlus, Users, UserCog, ClipboardList, Scale, ShieldCheck, LineChart } from 'lucide-react';

export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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
          
          {/* Empty State / Quick Links */}
          {!searchQuery ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Quick Navigation</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  {[
                    { name: 'Customer Management', href: '/dashboard/clients', description: 'View and manage all customer profiles.', icon: User },
                    { name: 'Broadsheet & Repayment', href: '/dashboard/broadsheet', description: 'Monitor loan broadsheets and repayments.', icon: Folder },
                    { name: 'Loan Configurations', href: '/dashboard/loan-terms', description: 'Configure loan terms and conditions.', icon: Settings },
                    { name: 'Agent Recruitment', href: '/dashboard/invites', description: 'Manage new agent recruitment and invites.', icon: UserPlus },
                    { name: 'Agent Management', href: '/dashboard/agent-management', description: 'Monitor and manage existing agents.', icon: Users },
                    { name: 'Role Management', href: '/dashboard/team', description: 'Configure system roles and permissions.', icon: UserCog },
                    { name: 'Maker/Checker Queue', href: '/dashboard/maker-checker', description: 'Review and approve pending actions.', icon: ClipboardList },
                    { name: 'Finance Reconciliation', href: '/dashboard/reconciliation', description: 'Reconcile financial records and transactions.', icon: Scale },
                    { name: 'Audit Trail Log', href: '/dashboard/audit-logs', description: 'Review system activity and audit logs.', icon: ShieldCheck },
                    { name: 'Reports', href: '/dashboard/reports', description: 'Generate and view system reports.', icon: LineChart }
                  ].map((route) => (
                    <button 
                      key={route.name}
                      onClick={() => { router.push(route.href); onClose(); }}
                      className="w-full flex items-center gap-4 p-3 hover:bg-slate-100/80 rounded-xl group transition-all text-left border border-transparent hover:border-slate-200"
                    >
                      <div className="p-2.5 bg-slate-100 rounded-lg group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-slate-200 transition-all text-slate-500 group-hover:text-[#018752] shrink-0">
                        <route.icon className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-slate-800 group-hover:text-[#018752] text-sm font-semibold mb-0.5 transition-colors">{route.name}</div>
                        <div className="text-xs text-slate-500 truncate">{route.description}</div>
                      </div>
                      <svg className="w-4 h-4 text-slate-300 group-hover:text-[#018752] shrink-0 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                  ))}
                </div>
              </div>
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
