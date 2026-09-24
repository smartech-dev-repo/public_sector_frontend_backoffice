"use client";

import { useState } from 'react';
import AdminsTab from './components/AdminsTab';
import RolesTab from './components/RolesTab';
import InvitesTab from './components/InvitesTab';
import DepartmentsTab from './components/DepartmentsTab';

export default function TeamManagementPage() {
  const [activeTab, setActiveTab] = useState<'admins' | 'roles' | 'departments' | 'invites'>('admins');

  const tabs = [
    { id: 'admins', label: 'Admins' },
    { id: 'roles', label: 'Roles' },
    { id: 'departments', label: 'Departments' },
    { id: 'invites', label: 'Invites' },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
      </div>

      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
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

      <div className="pt-4">
        {activeTab === 'admins' && <AdminsTab />}
        {activeTab === 'roles' && <RolesTab />}
        {activeTab === 'departments' && <DepartmentsTab />}
        {activeTab === 'invites' && <InvitesTab />}
      </div>
    </div>
  );
}
