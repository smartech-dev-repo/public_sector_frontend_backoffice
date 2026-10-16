"use client";

import { useEffect, useRef, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { User, Users, Folder, Settings, UserPlus, UserCog, ShieldCheck, ClipboardList, Scale, LineChart, Banknote, Search } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SYSTEM_ROUTES = [
  { name: 'Customer Management', href: '/dashboard/clients', description: 'View and manage all customer profiles.', icon: User, keywords: 'clients users customers kyc onboarding' },
  { name: 'Broadsheet & Repayment', href: '/dashboard/broadsheet', description: 'Monitor loan broadsheets, disbursement batches, and repayments.', icon: Folder, keywords: 'broadsheet repayment ippis batch upload excel schedule' },
  { name: 'Loan Products', href: '/dashboard/loan-terms', description: 'Configure loan products, interest tiers, sectors, and settings.', icon: Settings, keywords: 'loan products terms interest rates sectors settings' },
  { name: 'Loan Requests', href: '/dashboard/loan-requests', description: 'Review, approve, and disburse customer loan requests.', icon: Banknote, keywords: 'loan requests approval disbursement applications' },
  { name: 'Agent Recruitment', href: '/dashboard/invites', description: 'Manage new agent recruitment, invites, and invitations.', icon: UserPlus, keywords: 'agent recruitment invites invitations onboarding' },
  { name: 'Agent Management', href: '/dashboard/agent-management', description: 'Monitor active agents, credentials, and onboarding access.', icon: Users, keywords: 'agents field officers agents directory' },
  { name: 'Role Management', href: '/dashboard/team', description: 'Configure administrators, system roles, and access.', icon: UserCog, keywords: 'roles admins users team staff' },
  { name: 'Permissions Management', href: '/dashboard/permissions', description: 'Create and edit permission configurations.', icon: ShieldCheck, keywords: 'permissions rbac access control capabilities' },
  { name: 'Maker/Checker Queue', href: '/dashboard/maker-checker', description: 'Review and approve pending administrative actions.', icon: ClipboardList, keywords: 'maker checker pending approvals dual control' },
  { name: 'System Reports & Analytics', href: '/dashboard/reports', description: 'View client onboarding analytics, finance reconciliation, and audit logs.', icon: LineChart, keywords: 'reports analytics reconciliation audit logs kpi growth' }
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const filteredRoutes = useMemo(() => {
    if (!searchQuery.trim()) return SYSTEM_ROUTES;
    const query = searchQuery.toLowerCase().trim();
    return SYSTEM_ROUTES.filter(route => 
      route.name.toLowerCase().includes(query) ||
      route.description.toLowerCase().includes(query) ||
      route.keywords.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-border bg-card">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input 
            ref={inputRef}
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search navigation routes, tools, settings..." 
            className="flex-1 bg-transparent border-none outline-none px-3 text-foreground placeholder:text-muted-foreground text-sm font-medium"
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
          />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5 bg-muted/40">ESC</span>
            <button 
              onClick={onClose} 
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/40 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-3">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1 mb-1">
            {searchQuery ? `Matching Navigation (${filteredRoutes.length})` : 'Quick Navigation'}
          </div>

          {filteredRoutes.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">No matching system routes found</p>
              <p>Try searching for customers, broadsheets, loans, reports, or agents.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredRoutes.map((route) => (
                <button 
                  key={route.name}
                  onClick={() => { router.push(route.href); onClose(); }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-muted/40 rounded-xl group transition-all text-left border border-transparent hover:border-border/60"
                >
                  <div className="p-2 bg-muted/40 rounded-lg group-hover:bg-[#018752]/10 transition-colors text-muted-foreground group-hover:text-[#018752] shrink-0">
                    <route.icon className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-foreground group-hover:text-[#018752] text-xs font-semibold truncate transition-colors">
                      {route.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {route.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
