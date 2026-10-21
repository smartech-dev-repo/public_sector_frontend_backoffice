"use client";

import { useState, useMemo, useEffect } from 'react';
import AdminsTab from './components/AdminsTab';
import RolesTab from './components/RolesTab';
import InvitesTab from './components/InvitesTab';
import DepartmentsTab from './components/DepartmentsTab';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';

type TabId = 'admins' | 'roles' | 'departments' | 'invites';

export default function TeamManagementPage() {
 const { hasPermission, hasAnyPermission, isSuperAdmin } = useAdminPermissions();

 const tabs = useMemo(() => {
  const allTabs: { id: TabId; label: string; visible: boolean }[] = [
   { 
     id: 'admins', 
     label: 'Admins', 
     visible: isSuperAdmin || hasPermission('roles:manage') 
   },
   { 
     id: 'roles', 
     label: 'Roles', 
     visible: isSuperAdmin || hasAnyPermission(['roles:manage', 'permissions:manage']) 
   },
   { 
     id: 'departments', 
     label: 'Departments', 
     visible: isSuperAdmin || hasPermission('departments:manage') 
   },
   { 
     id: 'invites', 
     label: 'Invites', 
     visible: isSuperAdmin || hasPermission('admins:create') 
   },
  ];
  return allTabs.filter(t => t.visible);
 }, [hasPermission, hasAnyPermission, isSuperAdmin]);

 const [activeTab, setActiveTab] = useState<TabId>(() => {
  return tabs[0]?.id || 'admins';
 });

 useEffect(() => {
  if (tabs.length > 0 && !tabs.some(t => t.id === activeTab)) {
   setActiveTab(tabs[0].id);
  }
 }, [tabs, activeTab]);

 if (tabs.length === 0) {
  return (
   <div className="bg-card rounded-2xl border border-border p-12 text-center max-w-lg mx-auto mt-8">
    <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">!</div>
    <h3 className="text-lg font-semibold text-foreground mb-1">Access Restricted</h3>
    <p className="text-sm text-muted-foreground">You do not have permission to manage team members, roles, or departments.</p>
   </div>
  );
 }

 return (
  <div className="space-y-3">
   <div className="border-b border-border">
    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
     {tabs.map((tab) => (
      <button
       key={tab.id}
       onClick={() => setActiveTab(tab.id)}
       className={`
        whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors
        ${activeTab === tab.id
         ? 'border-primary text-primary'
         : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
        }
       `}
      >
       {tab.label}
      </button>
     ))}
    </nav>
   </div>

   <div className="pt-1">
    {activeTab === 'admins' && <AdminsTab />}
    {activeTab === 'roles' && <RolesTab />}
    {activeTab === 'departments' && <DepartmentsTab />}
    {activeTab === 'invites' && <InvitesTab />}
   </div>
  </div>
 );
}
