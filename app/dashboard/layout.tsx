"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Toast from '@/app/components/ui/Toast';
import Modal from '@/app/components/ui/Modal';
import SearchModal from '@/app/components/ui/SearchModal';
import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun, Folder, UserPlus, Users, User, LineChart, UserCog, ClipboardList, Scale, ShieldCheck, Settings } from 'lucide-react';

export default function CreditRiskLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const closeDropdowns = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target as Node)) {
        setIsThemeDropdownOpen(false);
      }
    };

    document.addEventListener('click', closeDropdowns);
    return () => {
      document.removeEventListener('click', closeDropdowns);
    };
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  const pageTitle = useMemo(() => {
    if (pathname === '/dashboard') return 'Platform Overview';
    if (pathname.includes('/dashboard/maker-checker')) return 'Maker/Checker Queue';
    if (pathname.includes('/dashboard/agent-security')) return 'Agent Security & Suspension';
    if (pathname.includes('/dashboard/agent')) return 'Agent Application Details';
    if (pathname.includes('/dashboard/audit-logs')) return 'Audit Trail Log';
    if (pathname.includes('/dashboard/team')) return 'Team Management';
    if (pathname.includes('/dashboard/uploads')) return 'Credit Risk Uploads';
    if (pathname.includes('/dashboard/analytics')) return 'Analytics & Reports';
    if (pathname.includes('/dashboard/exceptions')) return 'Exception Queue';
    if (pathname.includes('/dashboard/reconciliation')) return 'Finance Reconciliation';
    return 'Platform Overview';
  }, [pathname]);

  const triggerLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    router.push('/login');
  };

  const themeIcon = mounted ? (
    resolvedTheme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />
  ) : <Sun className="w-5 h-5" />;

  const cycleTheme = () => {
    const order = ['light', 'dark', 'system'];
    const i = order.indexOf(theme || 'system');
    setTheme(order[(i + 1) % order.length]);
  };

  return (
    <div className="h-screen overflow-hidden bg-background font-sans flex text-foreground">
      {/* Global Components */}
      <Toast />
      <SearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />
      <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={confirmLogout} title="Confirm Logout">
        Are you sure you want to securely log out of the Admin Portal?
      </Modal>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-foreground/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      <aside className={`
        bg-card border-r border-border text-foreground flex-shrink-0 flex flex-col z-40 transition-all duration-300
        fixed inset-y-0 left-0 md:relative md:translate-x-0
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isSidebarMinimized ? 'w-20' : 'w-80'}
      `}>
        {/* Sidebar Shrink Toggle */}
        <button 
          onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
          className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 items-center justify-center w-7 h-7 rounded-full bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all shadow-sm z-50"
          title={isSidebarMinimized ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {!isSidebarMinimized ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          )}
        </button>

        <div className={`pt-8 pb-4 flex items-center border-b border-transparent gap-3 ${isSidebarMinimized ? 'justify-center px-4' : 'justify-center px-6'}`}>
          {!isSidebarMinimized && (
            <div className="flex items-center gap-3 overflow-hidden w-full">
              <div className="w-full flex items-center justify-center">
                  <Link href="/dashboard" className="flex items-center justify-center cursor-pointer w-full">
                    <img src="/logo.png" className="h-9 w-auto dark:invert" alt="Logo" />
                  </Link>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6 space-y-2 flex-1 overflow-y-auto overflow-x-hidden">
          <nav className="space-y-2">
            <Link href="/dashboard/broadsheet"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                pathname.startsWith('/dashboard/broadsheet') ? 'bg-[#018752] text-white [&>svg]:text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
              title={isSidebarMinimized ? 'Broadsheet and Repayment' : ''}
            >
              <Folder className="w-5 h-5 shrink-0 transition-colors" />
              {!isSidebarMinimized && <span className="whitespace-nowrap">Broadsheet and Repayment</span>}
            </Link>
            <Link href="/dashboard/agent-recruitment"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                pathname.startsWith('/dashboard/agent-recruitment') ? 'bg-[#018752] text-white [&>svg]:text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
              title={isSidebarMinimized ? 'Agent Recruitment' : ''}
            >
              <UserPlus className="w-5 h-5 shrink-0 transition-colors" />
              {!isSidebarMinimized && <span className="whitespace-nowrap">Agent Recruitment</span>}
            </Link>
            <Link href="/dashboard/agent-management"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                pathname.startsWith('/dashboard/agent-management') ? 'bg-[#018752] text-white [&>svg]:text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
              title={isSidebarMinimized ? 'Agent Management' : ''}
            >
              <Users className="w-5 h-5 shrink-0 transition-colors" />
              {!isSidebarMinimized && <span className="whitespace-nowrap">Agent Management</span>}
            </Link>
            <Link href="/dashboard/clients"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                pathname.startsWith('/dashboard/client') ? 'bg-[#018752] text-white [&>svg]:text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
              title={isSidebarMinimized ? 'Customer Management' : ''}
            >
              <User className="w-5 h-5 shrink-0 transition-colors" />
              {!isSidebarMinimized && <span className="whitespace-nowrap">Customer Management</span>}
            </Link>
            <Link href="/dashboard/reports"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                pathname.startsWith('/dashboard/reports') ? 'bg-[#018752] text-white [&>svg]:text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
              title={isSidebarMinimized ? 'Report' : ''}
            >
              <LineChart className="w-5 h-5 shrink-0 transition-colors" />
              {!isSidebarMinimized && <span className="whitespace-nowrap">Report</span>}
            </Link>
            <Link href="/dashboard/team"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                pathname.startsWith('/dashboard/team') ? 'bg-[#018752] text-white [&>svg]:text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
              title={isSidebarMinimized ? 'Role management' : ''}
            >
              <UserCog className="w-5 h-5 shrink-0 transition-colors" />
              {!isSidebarMinimized && <span className="whitespace-nowrap">Role management</span>}
            </Link>
            <Link href="/dashboard/maker-checker"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                pathname.startsWith('/dashboard/maker-checker') ? 'bg-[#018752] text-white [&>svg]:text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
              title={isSidebarMinimized ? 'Maker/Checker Queue' : ''}
            >
              <ClipboardList className="w-5 h-5 shrink-0 transition-colors" />
              {!isSidebarMinimized && <span className="whitespace-nowrap">Maker/Checker Queue</span>}
            </Link>
            <Link href="/dashboard/reconciliation"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                pathname.startsWith('/dashboard/reconciliation') ? 'bg-[#018752] text-white [&>svg]:text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
              title={isSidebarMinimized ? 'Finance Reconciliation' : ''}
            >
              <Scale className="w-5 h-5 shrink-0 transition-colors" />
              {!isSidebarMinimized && <span className="whitespace-nowrap">Finance Reconciliation</span>}
            </Link>
            <Link href="/dashboard/audit-logs"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                pathname.startsWith('/dashboard/audit-logs') ? 'bg-[#018752] text-white [&>svg]:text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
              title={isSidebarMinimized ? 'Audit Trail Log' : ''}
            >
              <ShieldCheck className="w-5 h-5 shrink-0 transition-colors" />
              {!isSidebarMinimized && <span className="whitespace-nowrap">Audit Trail Log</span>}
            </Link>

            <Link href="/dashboard/loan-terms"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                pathname.startsWith('/dashboard/loan-terms') ? 'bg-[#018752] text-white [&>svg]:text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
              title={isSidebarMinimized ? 'Loan Configurations' : ''}
            >
              <Settings className="w-5 h-5 shrink-0 transition-colors" />
              {!isSidebarMinimized && <span className="whitespace-nowrap">Loan Configurations</span>}
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-border flex flex-col gap-2">
          <button 
            onClick={triggerLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all group"
            title={isSidebarMinimized ? 'Logout' : ''}
          >
            <svg className="w-5 h-5 shrink-0 text-muted-foreground group-hover:text-destructive transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            {!isSidebarMinimized && <span className="whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <header className="h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3 sm:gap-8 flex-1">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">{pageTitle}</h1>

            {/* Global Search Trigger */}
            <div className="hidden max-w-md w-full relative sm:block">
              <button 
                onClick={() => setShowSearchModal(true)}
                className="w-full flex items-center bg-muted border border-border hover:border-muted-foreground/30 rounded-full pl-4 pr-3 py-2 text-sm text-muted-foreground outline-none transition-colors group"
              >
                <svg className="w-4 h-4 text-muted-foreground mr-2 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <span className="flex-1 text-left">Search loans, agents, audit logs...</span>
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] text-muted-foreground bg-card border border-border rounded-md">⌘K</kbd>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0 relative">
            {/* Theme toggle with dropdown */}
            <div className="relative" ref={themeDropdownRef}>
              <button 
                onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)} 
                className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors" 
                title="Theme settings"
              >
                {themeIcon}
              </button>
              {isThemeDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-40 bg-popover rounded-xl shadow-lg border border-border py-1 z-50">
                  <button 
                    onClick={() => { setTheme('light'); setIsThemeDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${theme === 'light' ? 'text-primary font-medium bg-accent' : 'text-popover-foreground hover:bg-accent'}`}
                  >
                    <Sun className="w-4 h-4" /> Light
                  </button>
                  <button 
                    onClick={() => { setTheme('dark'); setIsThemeDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${theme === 'dark' ? 'text-primary font-medium bg-accent' : 'text-popover-foreground hover:bg-accent'}`}
                  >
                    <Moon className="w-4 h-4" /> Dark
                  </button>
                  <button 
                    onClick={() => { setTheme('system'); setIsThemeDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${theme === 'system' ? 'text-primary font-medium bg-accent' : 'text-popover-foreground hover:bg-accent'}`}
                  >
                    <Monitor className="w-4 h-4" /> System
                  </button>
                </div>
              )}
            </div>

            <div ref={profileDropdownRef}>
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} 
                className="flex items-center gap-2 sm:gap-3 border-l border-border pl-3 sm:pl-4 hover:bg-accent py-1.5 rounded-lg transition-colors cursor-pointer text-left"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-muted overflow-hidden border-2 border-card shrink-0">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="User" className="w-full h-full object-cover" />
                </div>
                <div className="hidden sm:block">
                    <div className="text-sm text-foreground font-medium">Sarah Admin</div>
                    <div className="text-xs text-muted-foreground">Internal Control</div>
                </div>
                <div className="text-muted-foreground hover:text-foreground transition-colors ml-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </button>
              
              {isProfileDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-popover rounded-xl shadow-lg border border-border py-1 z-50">
                  <div className="px-4 py-2 border-b border-border mb-1">
                    <div className="text-sm font-medium text-popover-foreground">Sarah Admin</div>
                    <div className="text-xs text-muted-foreground">sarah@example.com</div>
                  </div>
                  <button className="w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-primary transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    Profile Settings
                  </button>
                  <button onClick={triggerLogout} className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
