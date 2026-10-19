"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/app/composables/usePermissions';
import PulseLoader from '@/app/components/ui/PulseLoader';

const CANDIDATE_ROUTES: { path: string; permissions: string[] }[] = [
  { path: '/dashboard/broadsheet', permissions: ['ippis:upload', 'loans:upload', 'repayments:upload'] },
  { path: '/dashboard/reports', permissions: ['audit:read', 'reconciliation:read', 'clients:analytics:read', 'agents:analytics:read'] },
  { path: '/dashboard/loan-requests', permissions: ['loan-requests:review', 'client-loans:read'] },
  { path: '/dashboard/clients', permissions: ['clients:read', 'clients:review', 'clients:onboard'] },
  { path: '/dashboard/agent-management', permissions: ['agents:read', 'agents:review'] },
  { path: '/dashboard/invites', permissions: ['agents:recruitment:read', 'agents:recruitment:manage'] },
  { path: '/dashboard/team', permissions: ['roles:manage', 'admins:create', 'permissions:manage', 'departments:manage'] },
  { path: '/dashboard/loan-terms', permissions: ['loan-products:manage', 'loan-terms:manage'] },
];

export default function DashboardIndex() {
  const router = useRouter();
  const { isSuperAdmin, hasPermission, loading } = usePermissions();

  useEffect(() => {
    if (loading) return;

    if (isSuperAdmin) {
      router.replace('/dashboard/broadsheet');
      return;
    }

    const target = CANDIDATE_ROUTES.find(r => r.permissions.some(p => hasPermission(p)));
    if (target) {
      router.replace(target.path);
    } else {
      router.replace('/dashboard/reports');
    }
  }, [router, isSuperAdmin, hasPermission, loading]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <PulseLoader />
    </div>
  );
}
