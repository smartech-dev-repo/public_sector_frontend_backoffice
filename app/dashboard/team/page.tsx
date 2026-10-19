"use client";

import { useState, useMemo, useEffect } from 'react';
import AdminsTab from './components/AdminsTab';
import RolesTab from './components/RolesTab';
import InvitesTab from './components/InvitesTab';
import DepartmentsTab from './components/DepartmentsTab';
import { usePermissions } from '@/app/composables/usePermissions';

export default function TeamManagementPage() {
 const { hasPermission } = usePermissions();

 const allTabs = useMemo(() => [
  { id: 'admins' as const, label: 'Admins', perms: ['admins:create'] },
  { id: 'roles' as const, label: 'Roles', perms: ['roles:manage', 'permissions:manage'] },
  { id: 'departments' as const, label: 'Departments', perms: ['departments:manage'] },
  { id: 'invites' as const, label: 'Invites', perms: ['admins:create'] },
 ], []);

 const availableTabs = useMemo(() => {
  return allTabs.filter(tab => hasPermission(tab.perms));
 }, [allTabs, hasPermission]);

 const [activeTab, setActiveTab] = useState<'admins' | 'roles' | 'departments' | 'invites' | ''>(() => {
  return availableTabs[0]?.id || 'admins';
 });

 useEffect(() => {
  if (availableTabs.length > 0 && !availableTabs.some(t => t.id === activeTab)) {
   setActiveTab(availableTabs[0].id);
  }
 }, [availableTabs, activeTab]);

 if (availableTabs.length === 0) {
  return (
   <div className="p-8 text-center bg-card rounded-2xl border border-border">
    <p className="text-muted-foreground text-sm">No role or team management tabs available for your permissions.</p>
   </div>
  );
 }

 return (
  <div className="space-y-3">
   <div className="border-b border-border">
    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
     {availableTabs.map((tab) => (
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
