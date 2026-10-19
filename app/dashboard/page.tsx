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

    if (isSuperAdmin || hasAnyPermission(['loans:upload', 'repayments:upload', 'ippis:upload'])) {
      router.replace('/dashboard/broadsheet');
    } else if (hasAnyPermission(['loan-requests:review', 'client-loans:read'])) {
      router.replace('/dashboard/loan-requests');
    } else if (hasAnyPermission(['clients:read', 'clients:review', 'clients:onboard', 'clients:analytics:read'])) {
      router.replace('/dashboard/clients');
    } else if (hasAnyPermission(['audit:read', 'reconciliation:read', 'clients:analytics:read', 'agents:analytics:read'])) {
      router.replace('/dashboard/reports');
    } else if (hasAnyPermission(['agents:read', 'agents:review', 'agents:sessions:revoke', 'agents:onboarding-access:manage'])) {
      router.replace('/dashboard/agent-management');
    } else if (hasAnyPermission(['agents:recruitment:read', 'agents:recruitment:manage'])) {
      router.replace('/dashboard/invites');
    } else if (hasAnyPermission(['loan-terms:manage', 'loan-products:manage'])) {
      router.replace('/dashboard/loan-terms');
    } else if (hasAnyPermission(['roles:manage', 'admins:create', 'permissions:manage', 'departments:manage'])) {
      router.replace('/dashboard/team');
    } else {
      router.replace('/dashboard/loan-requests');
    }
  }, [isSuperAdmin, hasAnyPermission, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <PulseLoader />
    </div>
  );
}
