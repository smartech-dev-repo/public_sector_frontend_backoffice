"use client";

import TabCount from '@/app/components/ui/TabCount';
import { TabTotalScope, useTabTotals } from '@/app/composables/useTabTotals';
import { useListTotals } from '@/app/composables/useListTotals';
import { admins_api } from '@/app/api_factory/modules/admins';
import { roles_api } from '@/app/api_factory/modules/roles';
import { departments_api } from '@/app/api_factory/modules/departments';
import { invites_api } from '@/app/api_factory/modules/invites';
import { useState, useMemo, useEffect } from 'react';
import AdminsTab from './components/AdminsTab';
import RolesTab from './components/RolesTab';
import InvitesTab from './components/InvitesTab';
import DepartmentsTab from './components/DepartmentsTab';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';

type TabId = 'admins' | 'roles' | 'departments' | 'invites';

export default function TeamManagementPage() {
 const { hasPermission, isSuperAdmin } = useAdminPermissions();

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
     visible: isSuperAdmin || hasPermission('roles:manage') 
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
 }, [hasPermission, isSuperAdmin]);

 const [activeTab, setActiveTab] = useState<TabId>(() => {
  return tabs[0]?.id || 'admins';
 });

 useEffect(() => {
  if (tabs.length > 0 && !tabs.some(t => t.id === activeTab)) {
   setActiveTab(tabs[0].id);
  }
 }, [tabs, activeTab]);
 const shows = (id: TabId) => tabs.some((tab) => tab.id === id);
 const totals = useListTotals({
  admins: shows('admins') ? () => admins_api.getAdmins({ limit: 1 }) : null,
  roles: shows('roles') ? () => roles_api.getRoles({ limit: 1 }) : null,
  departments: shows('departments') ? () => departments_api.getDepartments({ limit: 1 }) : null,
  invites: shows('invites') ? () => invites_api.getInvites({ limit: 1 }) : null,
 });


 const { shown: shownTotals, report: reportTabTotal } = useTabTotals(totals, activeTab);

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
    <nav className="-mb-px flex gap-4 sm:gap-8 overflow-x-auto overflow-y-hidden [scrollbar-width:none]" aria-label="Tabs">
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
       <TabCount count={shownTotals[tab.id]} active={activeTab === tab.id} />
      </button>
     ))}
    </nav>
   </div>

   <TabTotalScope value={reportTabTotal}>
   <div className="pt-1">
    {activeTab === 'admins' && <AdminsTab />}
    {activeTab === 'roles' && <RolesTab />}
    {activeTab === 'departments' && <DepartmentsTab />}
    {activeTab === 'invites' && <InvitesTab />}
   </div>
   </TabTotalScope>
  </div>
 );
}
