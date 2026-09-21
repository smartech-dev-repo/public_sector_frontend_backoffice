"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Toast from '@/app/components/ui/Toast';
import Modal from '@/app/components/ui/Modal';
import SearchModal from '@/app/components/ui/SearchModal';
import { useTheme } from '@/app/composables/core/useTheme';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isDark, toggleTheme, initTheme } = useTheme();

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
    initTheme();

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
                    {/* Placeholder text for logo for now */}
                    <span className="font-bold text-lg text-emerald-600 tracking-tight">MAKERCHECKER</span>
                  </Link>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6 space-y-8 flex-1 overflow-y-auto overflow-x-hidden">
          {/* General Section */}
          <div>
            {!isSidebarMinimized && <div className="text-xs uppercase tracking-wider text-slate-500 mb-3">General</div>}
            <nav className="space-y-2">
              <Link href="/dashboard"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  pathname === '/dashboard' ? 'bg-emerald-600 text-white [&>svg]:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={isSidebarMinimized ? 'Overview' : ''}
              >
                <svg className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
                {!isSidebarMinimized && <span className="whitespace-nowrap">Platform Overview</span>}
              </Link>
              <Link href="/dashboard/analytics"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  pathname.startsWith('/dashboard/analytics') ? 'bg-emerald-600 text-white [&>svg]:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={isSidebarMinimized ? 'Analytics & Reports' : ''}
              >
                <svg className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                {!isSidebarMinimized && <span className="whitespace-nowrap">Analytics & Reports</span>}
              </Link>
            </nav>
          </div>

          {/* Portals Section */}
          <div className="mt-8">
            {!isSidebarMinimized && <div className="text-xs uppercase tracking-wider text-slate-500 mb-3">Portals</div>}
            <nav className="space-y-2">
              <Link href="/credit-risk/broadsheet"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  pathname.startsWith('/credit-risk') ? 'bg-emerald-600 text-white [&>svg]:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={isSidebarMinimized ? 'Credit Risk Portal' : ''}
              >
                <svg className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                {!isSidebarMinimized && <span className="whitespace-nowrap">Credit Risk Portal</span>}
              </Link>
            </nav>
          </div>

          {/* Operations Section */}
          <div className="mt-8">
            {!isSidebarMinimized && <div className="text-xs uppercase tracking-wider text-slate-500 mb-3">Operations</div>}
            <nav className="space-y-2">
              <Link href="/dashboard/maker-checker"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  pathname.startsWith('/dashboard/maker-checker') ? 'bg-emerald-600 text-white [&>svg]:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={isSidebarMinimized ? 'Maker/Checker Queue' : ''}
              >
                <svg className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                {!isSidebarMinimized && <span className="whitespace-nowrap">Maker/Checker Queue</span>}
              </Link>
              <Link href="/dashboard/exceptions"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  pathname.startsWith('/dashboard/exceptions') ? 'bg-emerald-600 text-white [&>svg]:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={isSidebarMinimized ? 'Exception Queue' : ''}
              >
                <svg className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                {!isSidebarMinimized && <span className="whitespace-nowrap">Exception Queue</span>}
              </Link>
              <Link href="/dashboard/uploads"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  pathname.startsWith('/dashboard/uploads') ? 'bg-emerald-600 text-white [&>svg]:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={isSidebarMinimized ? 'Data Uploads' : ''}
              >
                <svg className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                {!isSidebarMinimized && <span className="whitespace-nowrap">Data Uploads</span>}
              </Link>
              <Link href="/dashboard/reconciliation"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  pathname.startsWith('/dashboard/reconciliation') ? 'bg-emerald-600 text-white [&>svg]:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={isSidebarMinimized ? 'Reconciliation' : ''}
              >
                <svg className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                </svg>
                {!isSidebarMinimized && <span className="whitespace-nowrap">Reconciliation</span>}
              </Link>
            </nav>
          </div>

          {/* Administration Section */}
          <div className="mt-8">
            {!isSidebarMinimized && <div className="text-xs uppercase tracking-wider text-slate-500 mb-3">Administration</div>}
            <nav className="space-y-2">
              <Link href="/dashboard/team"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  pathname.startsWith('/dashboard/team') ? 'bg-emerald-600 text-white [&>svg]:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={isSidebarMinimized ? 'Team Management' : ''}
              >
                <svg className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                {!isSidebarMinimized && <span className="whitespace-nowrap">Team Management</span>}
              </Link>
              <Link href="/dashboard/admins"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  pathname.startsWith('/dashboard/admins') ? 'bg-emerald-600 text-white [&>svg]:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={isSidebarMinimized ? 'Admin Users' : ''}
              >
                <svg className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
                {!isSidebarMinimized && <span className="whitespace-nowrap">Admin Users</span>}
              </Link>
              <Link href="/dashboard/roles"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  pathname.startsWith('/dashboard/roles') ? 'bg-emerald-600 text-white [&>svg]:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={isSidebarMinimized ? 'Roles' : ''}
              >
                <svg className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                {!isSidebarMinimized && <span className="whitespace-nowrap">Roles</span>}
              </Link>
              <Link href="/dashboard/permissions"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  pathname.startsWith('/dashboard/permissions') ? 'bg-emerald-600 text-white [&>svg]:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={isSidebarMinimized ? 'Permissions' : ''}
              >
                <svg className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
                </svg>
                {!isSidebarMinimized && <span className="whitespace-nowrap">Permissions</span>}
              </Link>
              <Link href="/dashboard/invites"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  pathname.startsWith('/dashboard/invites') ? 'bg-emerald-600 text-white [&>svg]:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={isSidebarMinimized ? 'Invites' : ''}
              >
                <svg className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5M10 12l2.25 1.5M14 12l-2.25 1.5"></path>
                </svg>
                {!isSidebarMinimized && <span className="whitespace-nowrap">Invites</span>}
              </Link>
              <Link href="/dashboard/agent-security"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  pathname.startsWith('/dashboard/agent-security') ? 'bg-emerald-600 text-white [&>svg]:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={isSidebarMinimized ? 'Agent Security' : ''}
              >
                <svg className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                {!isSidebarMinimized && <span className="whitespace-nowrap">Agent Security</span>}
              </Link>
              <Link href="/dashboard/audit"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  pathname.startsWith('/dashboard/audit') ? 'bg-emerald-600 text-white [&>svg]:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={isSidebarMinimized ? 'Audit Trail (Mock)' : ''}
              >
                <svg className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                {!isSidebarMinimized && <span className="whitespace-nowrap">Audit Trail (Mock)</span>}
              </Link>
              <Link href="/dashboard/audit-logs"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  pathname.startsWith('/dashboard/audit-logs') ? 'bg-emerald-600 text-white [&>svg]:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={isSidebarMinimized ? 'Audit Logs (API)' : ''}
              >
                <svg className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
                {!isSidebarMinimized && <span className="whitespace-nowrap">Audit Logs (API)</span>}
              </Link>
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 flex flex-col gap-2">
          <button 
            onClick={triggerLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all group"
            title={isSidebarMinimized ? 'Logout' : ''}
          >
            <svg className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-rose-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            {!isSidebarMinimized && <span className="whitespace-nowrap">Logout</span>}
          </button>
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
              onClick={toggleTheme} 
              className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-slate-50 rounded-lg transition-colors" 
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
              )}
            </button>
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
