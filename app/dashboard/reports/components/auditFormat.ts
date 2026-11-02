const ACTION_LABELS: Record<string, string> = {
 'admin.login.succeeded': 'Admin signed in',
 'admin.login.failed': 'Admin sign-in failed',
 'admin.logout': 'Admin signed out',
 'admin.logout_all': 'Admin signed out everywhere',
 'admin.password.reset_requested': 'Admin requested password reset',
 'admin.password.reset': 'Admin password reset',
 'admin.password.changed': 'Admin changed password',
 'admin.password.change_failed': 'Admin password change failed',
 'admin.2fa.enabled': 'Admin turned on 2FA',
 'admin.2fa.disabled': 'Admin turned off 2FA',
 'agent.login.succeeded': 'Agent signed in',
 'agent.login.failed': 'Agent sign-in failed',
 'agent.logout': 'Agent signed out',
 'agent.logout_all': 'Agent signed out everywhere',
 'agent.password.reset_requested': 'Agent requested password reset',
 'agent.password.reset': 'Agent password reset',
 'agent.password.changed': 'Agent changed password',
 'agent.password.change_failed': 'Agent password change failed',
 'agent.2fa.enabled': 'Agent turned on 2FA',
 'agent.2fa.disabled': 'Agent turned off 2FA',
 'agent.onboarding_access.changed': 'Agent onboarding access changed',
 'agent.client_access.denied': 'Agent blocked from another agent\'s client',
 'client.login.succeeded': 'Client signed in',
 'client.login.failed': 'Client sign-in failed',
 'client.logout': 'Client signed out',
 'client.logout_all': 'Client signed out everywhere',
 'document.upload.submitted': 'File uploaded',
 'document.upload.reviewed': 'File review finished',
 'document.upload.confirmed': 'File merge confirmed',
 'document.upload.cancelled': 'File upload cancelled',
 'document.upload.completed': 'File merged',
 'document.upload.failed': 'File processing failed',
 'loan-product.created': 'Loan product created',
 'loan-product.updated': 'Loan product edited',
 'loan-settings.updated': 'Loan settings changed',
 'management-fee.created': 'Management fee created',
 'management-fee.updated': 'Management fee edited',
 'management-fee.deleted': 'Management fee deleted',
 'access.denied': 'Access denied',
 'sector.created': 'Sector added',
 'sector.updated': 'Sector renamed',
 'sector.deleted': 'Sector removed',
 'approval.requested': 'Sent for approval',
 'approval.approved': 'Approval given',
 'approval.rejected': 'Approval rejected',
 'approval.cancelled': 'Approval request withdrawn',
 'approval.failed': 'Approved action could not complete',
 'approval.assigned': 'Approval assigned',
 'approval.unassigned': 'Approval opened to any approver',
 'agent.application_submitted': 'Agent application submitted',
 'alert-recipient.added': 'Alert recipient added',
 'alert-recipient.updated': 'Alert recipient changed',
 'alert-recipient.removed': 'Alert recipient removed',
 'admin.login.denied': 'Admin sign-in blocked',
 'agent.login.denied': 'Agent sign-in blocked',
 'session.revoked': 'User signed out by admin',
 'sessions.revoked_for_user': 'User signed out everywhere by admin',
 'audit.exported': 'Audit trail exported',
 'data.exported': 'Data exported',
 'data.revealed': 'Sensitive value revealed',
 'client.profile.viewed': 'Client profile viewed',
 'client.onboarding.started': 'Client onboarding started',
 'client.onboarding.ippis_linked': 'IPPIS record linked',
 'client.onboarding.identity_submitted': 'BVN and NIN submitted',
 'client.onboarding.face_match': 'Face match run',
 'client.onboarding.marital_status_updated': 'Marital status updated',
 'client.onboarding.document_uploaded': 'Client document uploaded',
 'loan-request.created': 'Loan request created',
 'loan-request.topup_created': 'Top-up request created',
 'loan-request.code_resent': 'Loan confirmation code resent',
 'loan-request.code_confirmed': 'Loan confirmed with code',
 'wallet.applied_to_loan': 'Wallet applied to loan',
 'admin.invite.created': 'Admin invited',
 'admin.invite.resent': 'Admin invite resent',
 'admin.invite.deleted': 'Admin invite deleted',
 'admin.role.set': 'Admin role changed',
 'admin.suspended': 'Admin deactivated',
 'admin.unsuspended': 'Admin reactivated',
 'agent.approved': 'Agent approved',
 'agent.rejected': 'Agent rejected',
 'agent.credentials_resent': 'Agent credentials resent',
 'agent.sessions.revoked': 'Agent logged out by admin',
 'agent_recruitment_application.deleted': 'Recruitment application deleted',
 'client.review.approved': 'Client approved',
 'client.review.retried': 'Client review retried',
 'client.sessions.revoked': 'Client logged out by admin',
 'department.created': 'Department created',
 'department.deleted': 'Department deleted',
 'loan-request.approve': 'Loan request approved',
 'loan-request.confirm-code': 'Loan confirmation code entered',
 'loan-request.reject': 'Loan request rejected',
 'loan-request.disburse': 'Loan disbursed',
 'permission.created': 'Permission created',
 'permission.deleted': 'Permission deleted',
 'role.created': 'Role created',
 'role.updated': 'Role details edited',
 'role.deleted': 'Role deleted',
 'role.permission.assigned': 'Permission added to role',
 'role.permission.removed': 'Permission removed from role',
 'role.permissions.bulk_assigned': 'Permissions added to role',
 'role.permissions.replaced': 'Role permissions changed',
 'session.reuse_detected': 'Stolen session suspected',
 'wallet.credit': 'Wallet credited',
 'wallet.debit': 'Wallet debited',
};

export const ACTION_OPTIONS = Object.entries(ACTION_LABELS)
 .map(([value, label]) => ({ value, label }))
 .sort((a, b) => a.label.localeCompare(b.label));

export const TARGET_TYPE_OPTIONS = [
 { value: 'AdminInvite', label: 'Admin invite' },
 { value: 'AdminUser', label: 'Admin' },
 { value: 'Agent', label: 'Agent' },
 { value: 'ApprovalRequest', label: 'Approval' },
 { value: 'AgentApplication', label: 'Agent application' },
 { value: 'AlertRecipient', label: 'Alert recipient' },
 { value: 'Client', label: 'Client' },
 { value: 'Department', label: 'Department' },
 { value: 'LoanProduct', label: 'Loan product' },
 { value: 'LoanRequest', label: 'Loan request' },
 { value: 'ManagementFee', label: 'Management fee' },
 { value: 'DocumentUploadBatch', label: 'Uploaded file' },
 { value: 'Permission', label: 'Permission' },
 { value: 'Role', label: 'Role' },
 { value: 'Sector', label: 'Sector' },
];

const METHOD_VERBS: Record<string, string> = { POST: 'Created', PUT: 'Updated', PATCH: 'Updated', DELETE: 'Deleted' };
const IS_ID = /^[0-9a-f]{8}-[0-9a-f-]{27}$/i;

export interface AuditRequest {
 method: string;
 path: string;
 status: number;
}

export const parseRequest = (action: string): AuditRequest | null => {
 const match = action?.match(/^(GET|POST|PUT|PATCH|DELETE)\s+(\S+)\s+\((\d+)\)$/);
 return match ? { method: match[1], path: match[2], status: Number(match[3]) } : null;
};

// "/admin/management-fees/<id>?x=1" reads as "management fees", "/admin/me/profile-image" as "profile image".
const areaOf = (path: string) =>
 path.split('?')[0].split('/').filter((part) => part && part !== 'admin' && part !== 'me' && !IS_ID.test(part)).join(' ').replace(/[-_]/g, ' ');

export const describeAction = (action: string) => {
 const request = parseRequest(action);
 if (!request) {
  const refused = action?.match(/^(.+)\.failed$/)?.[1];
  if (!ACTION_LABELS[action] && refused && ACTION_LABELS[refused]) return `Failed: ${ACTION_LABELS[refused].toLowerCase()}`;
  return ACTION_LABELS[action] || action;
 }
 const label = `${METHOD_VERBS[request.method] ?? request.method} ${areaOf(request.path)}`.trim();
 return request.status >= 400 ? `Failed: ${label.toLowerCase()}` : label;
};

export const describeDevice = (userAgent?: string | null) => {
 if (!userAgent) return null;
 const browser = /Edg\//.test(userAgent) ? 'Edge'
  : /OPR\//.test(userAgent) ? 'Opera'
   : /Chrome\//.test(userAgent) ? 'Chrome'
    : /Firefox\//.test(userAgent) ? 'Firefox'
     : /Safari\//.test(userAgent) ? 'Safari'
      : 'Unknown browser';
 const system = /Windows/.test(userAgent) ? 'Windows'
  : /Android/.test(userAgent) ? 'Android'
   : /iPhone|iPad/.test(userAgent) ? 'iOS'
    : /Mac OS X/.test(userAgent) ? 'macOS'
     : /Linux/.test(userAgent) ? 'Linux'
      : null;
 return system ? `${browser} on ${system}` : browser;
};

export const principalName = (principal: any) =>
 principal?.fullName || principal?.onboarding?.employeeName || principal?.employeeName || principal?.name || principal?.productName || principal?.originalFileName || principal?.email || principal?.key || principal?.phone || null;

export const formatDetailValue = (value: unknown) => {
 if (value === null || value === undefined || value === '') return '—';
 if (Array.isArray(value)) return value.length ? value.join(', ') : 'None';
 if (typeof value === 'object') return JSON.stringify(value);
 return String(value);
};

export const OUTCOME_LABELS: Record<string, string> = { success: 'Successful', failed: 'Failed', blocked: 'Blocked' };

export const OUTCOME_STYLES: Record<string, string> = {
 success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
 failed: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
 blocked: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300',
};

const ID_VALUE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const HIDDEN_DETAILS = new Set(['changes', 'error', 'reason', 'status', 'filters', 'email', 'phone']);

// Internal ids mean nothing to a reader, and a record is reached through its link.
export const visibleDetails = (metadata: unknown) =>
 Object.entries((metadata ?? {}) as Record<string, unknown>).filter(
  ([key, value]) => !HIDDEN_DETAILS.has(key) && !/ids?$/i.test(key) && !ID_VALUE.test(JSON.stringify(value) ?? '') && value !== null,
 );

const RECORD_ROUTES: Record<string, string> = {
 Client: '/dashboard/clients',
 Agent: '/dashboard/agent',
 LoanRequest: '/dashboard/loan-requests',
 ApprovalRequest: '/dashboard/approvals',
};

export const recordHref = (targetType?: string | null, targetId?: string | null) =>
 targetType && targetId && RECORD_ROUTES[targetType] ? `${RECORD_ROUTES[targetType]}/${targetId}` : null;

export const humanizeKey = (key: string) => {
 const words = key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ').toLowerCase();
 return words.charAt(0).toUpperCase() + words.slice(1);
};
