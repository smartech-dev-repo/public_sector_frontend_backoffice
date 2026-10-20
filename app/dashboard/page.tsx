"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';
import PulseLoader from '@/app/components/ui/PulseLoader';

export default function DashboardIndex() {
  const router = useRouter();
  const { isSuperAdmin, hasAnyPermission, loading } = useAdminPermissions();

  useEffect(() => {
    if (loading) return;

    if (isSuperAdmin || hasAnyPermission(['loans:upload', 'repayments:upload', 'ippis:upload', 'documents:read'])) {
      router.replace('/dashboard/broadsheet');
    } else if (hasAnyPermission(['loan-requests:review', 'client-loans:read', 'clients:read'])) {
      router.replace('/dashboard/loan-requests');
    } else if (hasAnyPermission(['clients:read', 'clients:review', 'clients:onboard', 'clients:analytics:read', 'ippis:upload', 'wallets:read', 'wallets:manage'])) {
      router.replace('/dashboard/clients');
    } else if (hasAnyPermission(['audit:read', 'reconciliation:read', 'clients:analytics:read', 'agents:analytics:read'])) {
      router.replace('/dashboard/reports');
    } else if (hasAnyPermission(['agents:read', 'agents:review', 'agents:sessions:revoke', 'agents:onboarding-access:manage', 'agents:analytics:read'])) {
      router.replace('/dashboard/agent-management');
    } else if (hasAnyPermission(['agents:recruitment:read', 'agents:recruitment:manage', 'agents:recruitment:analytics:read'])) {
      router.replace('/dashboard/invites');
    } else if (hasAnyPermission(['loan-products:manage', 'loan-settings:manage', 'loans:upload'])) {
      router.replace('/dashboard/loan-terms');
    } else if (hasAnyPermission(['roles:manage', 'admins:create', 'permissions:manage', 'departments:manage'])) {
      router.replace('/dashboard/team');
    } else {
      router.replace('/dashboard/settings');
    }
  }, [isSuperAdmin, hasAnyPermission, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <PulseLoader />
    </div>
  );
}
