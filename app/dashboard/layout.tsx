"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Modal from '@/app/components/ui/Modal';
import SearchModal from '@/app/components/ui/SearchModal';
import SessionManager from '@/app/components/ui/SessionManager';
import ProfileDropdown from '@/app/components/ui/ProfileDropdown';
import { useProfile } from '@/app/composables/modules/useProfile';
import { useTheme } from 'next-themes';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';
import { clearAuthStorage } from '@/app/composables/core/useAuth';
import { 
  Sun, 
  Moon, 
  Monitor, 
  Folder, 
  Settings, 
  UserPlus, 
  Users, 
  Banknote, 
  User, 
  LineChart, 
  ShieldCheck, 
  ChevronDown, 
  ShieldAlert 
} from 'lucide-react';

export default function CreditRiskLayout({ children }: { children: React.ReactNode }) {
 const pathname = usePathname();
 const router = useRouter();
 const { theme, setTheme, resolvedTheme } = useTheme();
 const [mounted, setMounted] = useState(false);
 const { profile, fetchProfile } = useProfile();
 const { hasPermission, hasAnyPermission, canAccessRoute, isSuperAdmin } = useAdminPermissions();

 useEffect(() => {
  fetchProfile();
 }, [fetchProfile]);

 const displayName = useMemo(() => {
  if (profile?.fullName) return profile.fullName;
  if (profile?.firstName) return `${profile.firstName} ${profile.lastName || ''}`.trim();
  return 'Admin';
 }, [profile]);

 const displayRole = useMemo(() => {
  if (profile?.role?.name) return profile.role.name;
  return 'Administrator';
 }, [profile]);

 const displayInitials = useMemo(() => {
  if (profile?.firstName && profile?.lastName) {
   return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
  }
  if (profile?.fullName) {
   const parts = profile.fullName.trim().split(/\s+/);
   if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
   return parts[0].slice(0, 2).toUpperCase();
  }
  return 'AD';
 }, [profile]);

 const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
  loans: true,
  agents: true,
  catalog: true,
  system: false
 });

 const toggleGroup = (group: string) => {
  setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
 };
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
  if (pathname.includes('/dashboard/broadsheet')) return 'Broadsheet and Repayment';
  if (pathname.includes('/dashboard/loan-terms')) return 'Loan Products';
  if (pathname.includes('/dashboard/invites')) return 'Agent Recruitment';
  if (pathname.includes('/dashboard/agent-management')) return 'Agent Management';
  if (pathname.includes('/dashboard/loan-requests')) return 'Loan Management';
  if (pathname.includes('/dashboard/clients')) return 'Customer Management';
  if (pathname.includes('/dashboard/reports')) return 'System Reports';
  if (pathname.includes('/dashboard/team') || pathname.includes('/dashboard/roles') || pathname.includes('/dashboard/admins')) return 'Role & User Management';
  if (pathname.includes('/dashboard/maker-checker')) return 'Maker/Checker Queue';
  if (pathname.includes('/dashboard/agent-security')) return 'Agent Security & Suspension';
  if (pathname.includes('/dashboard/agent')) return 'Agent Application Details';
  if (pathname.includes('/dashboard/audit-logs')) return 'Audit Trail Log';
  if (pathname.includes('/dashboard/uploads')) return 'Credit Risk Uploads';
  if (pathname.includes('/dashboard/analytics')) return 'Analytics & Reports';
  if (pathname.includes('/dashboard/client-loans')) return 'Client Loans';
  if (pathname.includes('/dashboard/reconciliation')) return 'Finance Reconciliation';
  return 'Platform Overview';
 }, [pathname]);

 const triggerLogout = () => {
  setShowLogoutModal(true);
 };

 const confirmLogout = () => {
  setShowLogoutModal(false);
  clearAuthStorage();
  router.push('/login');
 };

 const navItems = useMemo(() => [
  {
   href: '/dashboard/broadsheet',
   label: 'Broadsheet and Repayment',
   icon: Folder,
   match: (p: string) => p.startsWith('/dashboard/broadsheet') || p.startsWith('/dashboard/uploads'),
   visible: hasAnyPermission(['loans:upload', 'repayments:upload', 'ippis:upload', 'documents:read']),
  },
  {
   href: '/dashboard/loan-terms',
   label: 'Loan Products',
   icon: Settings,
   match: (p: string) => p.startsWith('/dashboard/loan-terms') || p.startsWith('/dashboard/catalog/loans') || p.startsWith('/dashboard/loan-products'),
   visible: hasAnyPermission(['loan-products:manage', 'loan-settings:manage', 'loans:upload']),
  },
  {
   href: '/dashboard/invites',
   label: 'Agent Recruitment',
   icon: UserPlus,
   match: (p: string) => p.startsWith('/dashboard/invites'),
   visible: hasAnyPermission(['agents:recruitment:read', 'agents:recruitment:manage', 'agents:recruitment:analytics:read']),
  },
  {
   href: '/dashboard/agent-management',
   label: 'Agent Management',
   icon: Users,
   match: (p: string) => p.startsWith('/dashboard/agent-management') || p.startsWith('/dashboard/agent/') || p.startsWith('/dashboard/agent-security'),
   visible: hasAnyPermission(['agents:read', 'agents:review', 'agents:sessions:revoke', 'agents:onboarding-access:manage', 'agents:analytics:read']),
  },
  {
   href: '/dashboard/loan-requests',
   label: 'Loan Request',
   icon: Banknote,
   match: (p: string) => p.startsWith('/dashboard/loan-requests') || p.startsWith('/dashboard/client-loans') || p.startsWith('/dashboard/disbursement-summary') || p.startsWith('/dashboard/maker-checker'),
   visible: hasAnyPermission(['loan-requests:review', 'client-loans:read', 'clients:read']),
  },
  {
   href: '/dashboard/clients',
   label: 'Customer Management',
   icon: User,
   match: (p: string) => p.startsWith('/dashboard/clients') || p.startsWith('/dashboard/catalog/ippis'),
   visible: hasAnyPermission(['clients:read', 'clients:review', 'clients:onboard', 'clients:analytics:read', 'ippis:upload', 'wallets:read', 'wallets:manage']),
  },
  {
   href: '/dashboard/reports',
   label: 'Report',
   icon: LineChart,
   match: (p: string) => p.startsWith('/dashboard/reports') || p.startsWith('/dashboard/analytics') || p.startsWith('/dashboard/reconciliation') || p.startsWith('/dashboard/audit-logs'),
   visible: hasAnyPermission(['audit:read', 'reconciliation:read', 'clients:analytics:read', 'agents:analytics:read']),
  },
  {
   href: '/dashboard/team',
   label: 'Role Management',
   icon: ShieldCheck,
   match: (p: string) => p.startsWith('/dashboard/team') || p.startsWith('/dashboard/roles') || p.startsWith('/dashboard/admins') || p.startsWith('/dashboard/permissions'),
   visible: hasAnyPermission(['roles:manage', 'admins:create', 'permissions:manage', 'departments:manage']),
  },
 ], [hasAnyPermission]);

 return (
  <div className="h-screen overflow-hidden bg-background font-sans flex text-foreground">
   {/* Global Components */}
   <SessionManager />
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
    ${isSidebarMinimized ? 'w-20' : 'w-[275px]'}
   `}>
    {/* Sidebar Shrink Toggle */}
    <button 
     onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
     className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 items-center justify-center w-7 h-7 rounded-full bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all z-50"
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
          <img src="/logo.png" className="h-7 w-auto dark:invert" alt="Logo" />
         </Link>
       </div>
      </div>
     )}
    </div>
    <div className="px-3.5 py-4 space-y-2 flex-1 overflow-y-auto overflow-x-visible">
      <nav className="space-y-1">
           {navItems.filter(item => item.visible).map((item) => {
            const Icon = item.icon;
            const isActive = item.match(pathname);
            return (
             <Link 
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 py-2.5 rounded-xl text-[13px] font-medium transition-all group relative ${
               isSidebarMinimized ? 'justify-center px-2' : 'px-3'
              } ${
               isActive 
                ? 'bg-[#018752] text-white [&>svg]:text-white' 
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
             >
              <Icon className="w-[18px] h-[18px] shrink-0 transition-colors" />
              {!isSidebarMinimized && <span className="whitespace-nowrap">{item.label}</span>}
              {isSidebarMinimized && (
               <div className="hidden group-hover:block absolute left-14 bg-slate-800 text-white text-[11px] px-2 py-1 rounded whitespace-nowrap z-50">
                {item.label}
               </div>
              )}
             </Link>
            );
           })}
          </nav>
    </div>

    <div className="p-3 border-t border-border flex flex-col gap-2">
     <button 
      onClick={triggerLogout}
      className={`relative flex items-center gap-3 py-2.5 w-full rounded-xl text-[13px] font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all group ${isSidebarMinimized ? 'justify-center px-2' : 'px-3'}`}
      >
      {isSidebarMinimized && (
       <div className="hidden group-hover:block absolute left-14 bg-slate-800 text-white text-[11px] px-2 py-1 rounded whitespace-nowrap z-50">
        Logout
       </div>
      )}
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
        <Sun className="w-5 h-5 dark:hidden" />
        <Moon className="w-5 h-5 hidden dark:block" />
       </button>
       {isThemeDropdownOpen && (
        <div className="absolute top-full right-0 mt-2 w-40 bg-popover rounded-xl border border-border py-1 z-50">
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

      <div className="relative">
       <button 
        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} 
        className="flex items-center gap-2 sm:gap-3 border-l border-border pl-3 sm:pl-4 hover:bg-accent py-1.5 rounded-xl transition-colors cursor-pointer text-left"
       >
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#018752] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm border border-emerald-600 overflow-hidden">
         {profile?.profileImage ? (
          <img src={profile.profileImage} alt={displayName} className="w-full h-full object-cover" />
         ) : (
          displayInitials
         )}
        </div>
        <div className="hidden sm:block">
          <div className="text-sm text-foreground font-semibold leading-tight">{displayName}</div>
          <div className="text-xs text-muted-foreground">{displayRole}</div>
        </div>
        <div className="text-muted-foreground hover:text-foreground transition-colors ml-1">
         <ChevronDown className={`w-4 h-4 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
        </div>
       </button>
       
       <ProfileDropdown 
        isOpen={isProfileDropdownOpen}
        onClose={() => setIsProfileDropdownOpen(false)}
        onLogout={triggerLogout}
       />
      </div>
     </div>
    </header>

    <main className="flex-1 py-6 overflow-y-auto overflow-x-hidden">
     <div className="container mx-auto">
      {/* Route-level permission barrier commented out: permissions are controlled via sidebar navigation */}
      {/* {!canAccessRoute(pathname) ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-card rounded-2xl border border-border shadow-sm max-w-lg mx-auto mt-8">
          <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 border border-amber-200 dark:border-amber-800">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Your current role <span className="font-semibold text-foreground">({displayRole})</span> does not have the required permissions to view this section.
          </p>
          <button 
            onClick={() => {
              const firstAllowed = navItems.find(i => i.visible);
              router.push(firstAllowed ? firstAllowed.href : '/dashboard');
            }}
            className="mt-6 px-5 py-2.5 bg-[#018752] hover:bg-[#018752]/90 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            Go to Authorized Section
          </button>
        </div>
      ) : (
        children
      )} */}
      {children}
     </div>
    </main>
   </div>
  </div>
 );
}
