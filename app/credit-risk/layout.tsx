"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Toast from '@/app/components/ui/Toast';
import Modal from '@/app/components/ui/Modal';
import SearchModal from '@/app/components/ui/SearchModal';

export default function CreditRiskLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeProfileDropdown = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('click', closeProfileDropdown);

    return () => {
      document.removeEventListener('click', closeProfileDropdown);
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
    if (pathname.includes('/dashboard/team')) return 'Team Management';
    if (pathname.includes('/dashboard/uploads')) return 'Credit Risk Uploads';
    if (pathname.includes('/dashboard/analytics')) return 'Analytics & Reports';
    if (pathname.includes('/dashboard/exceptions')) return 'Exception Queue';
    if (pathname.includes('/dashboard/reconciliation')) return 'Finance Reconciliation';
    if (pathname.includes('/dashboard/audit')) return 'Audit Trail Log';
    return 'Platform Overview';
  }, [pathname]);

  const triggerLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    router.push('/login');
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-50 font-sans flex text-slate-800">
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
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      <aside className={`
        bg-white border-r border-slate-200 text-slate-800 flex-shrink-0 flex flex-col z-40 transition-all duration-300 relative
        fixed inset-y-0 left-0 md:relative md:translate-x-0
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isSidebarMinimized ? 'w-20' : 'w-64'}
      `}>
        {/* Sidebar Shrink Toggle */}
        <button 
          onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
          className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 items-center justify-center w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-600 transition-all shadow-sm z-50"
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

        <div className={`h-16 flex items-center border-b border-transparent gap-3 ${isSidebarMinimized ? 'justify-center px-4' : 'justify-center px-6'}`}>
          {!isSidebarMinimized && (
            <div className="flex items-center gap-3 overflow-hidden w-full">
              <div className="w-full flex items-center justify-center mb-6">
                  <Link href="/dashboard" className="flex items-center justify-center cursor-pointer w-full">
                    <img src="/logo.png" className="h-8 w-auto" alt="Logo" />
                  </Link>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6 space-y-2 flex-1 overflow-y-auto overflow-x-hidden">

          <Link href="/credit-risk/broadsheet" 
            className={`flex items-center gap-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group ${
              isSidebarMinimized ? 'justify-center px-0' : 'px-3'
            } ${pathname === '/credit-risk/broadsheet' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`} 
            title={isSidebarMinimized ? 'Broadsheet and Repayment' : ''}>
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
            {!isSidebarMinimized && <span>Broadsheet and Repayment</span>}
          </Link>



          <Link href="/credit-risk/agent-management" 
            className={`flex items-center gap-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group ${
              isSidebarMinimized ? 'justify-center px-0' : 'px-3'
            } ${pathname === '/credit-risk/agent-management' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`} 
            title={isSidebarMinimized ? 'Agent Management' : ''}>
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            {!isSidebarMinimized && <span>Agent Management</span>}
          </Link>



          <Link href="/credit-risk/reports" 
            className={`flex items-center gap-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group ${
              isSidebarMinimized ? 'justify-center px-0' : 'px-3'
            } ${pathname === '/credit-risk/reports' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`} 
            title={isSidebarMinimized ? 'Report' : ''}>
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            {!isSidebarMinimized && <span>Report</span>}
          </Link>
          
          <Link href="/credit-risk/disbursement-summary" 
            className={`flex items-center gap-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group ${
              isSidebarMinimized ? 'justify-center px-0' : 'px-3'
            } ${pathname === '/credit-risk/disbursement-summary' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`} 
            title={isSidebarMinimized ? 'Disbursement Summary' : ''}>
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {!isSidebarMinimized && <span>Disbursement Summary</span>}
          </Link>


          
          {/* Footer Action */}
          <div className="p-4 border-t border-slate-100 mt-auto">
              <Link href="/dashboard"
                  className={`flex items-center gap-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 transition-all group ${
                    isSidebarMinimized ? 'justify-center px-0' : 'px-3'
                  }`}
                  title={isSidebarMinimized ? 'Back to Dashboard' : ''}>
                  <svg className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  {!isSidebarMinimized && <span className="whitespace-nowrap">Back to Dashboard</span>}
              </Link>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3 sm:gap-8 flex-1">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <h1 className="text-xl text-slate-800 whitespace-nowrap">{pageTitle}</h1>

            {/* Global Search Trigger */}
            <div className="hidden max-w-md w-full relative sm:block">
              <button 
                onClick={() => setShowSearchModal(true)}
                className="w-full flex items-center bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-full pl-4 pr-3 py-2 text-sm text-slate-500 outline-none transition-colors group"
              >
                <svg className="w-4 h-4 text-slate-400 mr-2 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <span className="flex-1 text-left">Search loans, agents, audit logs...</span>
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] text-slate-400 bg-white border border-slate-200 rounded-md">⌘K</kbd>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0 relative" ref={profileDropdownRef}>
            <button 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} 
              className="flex items-center gap-3 border-l border-slate-200 pl-4 hover:bg-slate-50 py-1.5 rounded-lg transition-colors cursor-pointer text-left"
            >
              <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden border-2 border-white">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="User" className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block">
                  <div className="text-sm text-slate-700">Sarah Admin</div>
                  <div className="text-xs text-slate-500">Internal Control</div>
              </div>
              <div className="text-slate-400 hover:text-slate-600 transition-colors ml-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </button>
            
            {isProfileDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                <div className="px-4 py-2 border-b border-slate-100 mb-1">
                  <div className="text-sm font-medium text-slate-800">Sarah Admin</div>
                  <div className="text-xs text-slate-500">sarah@example.com</div>
                </div>
                <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  Profile Settings
                </button>
                <button onClick={triggerLogout} className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  Sign out
                </button>
              </div>
            )}
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
