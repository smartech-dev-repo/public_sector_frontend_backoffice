"use client";

import EmptyState from '@/app/components/ui/EmptyState';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';
import AuditTrail from './components/AuditTrail';

/** Every recorded action across the platform: who did what, to which record, and from where. */
export default function AuditLogsPage() {
  const { isSuperAdmin, hasPermission } = useAdminPermissions();
  const canAudit = isSuperAdmin || hasPermission('audit:read');

  if (!canAudit) {
    return (
      <div className="p-8">
        <EmptyState title="Access Restricted" description="You need the audit:read permission to view the audit trail." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="sr-only">Audit Trail</h1>
      <p className="text-sm text-muted-foreground">Every recorded action across the platform: who did it, to which record, and from where.</p>
      <AuditTrail />
    </div>
  );
}
