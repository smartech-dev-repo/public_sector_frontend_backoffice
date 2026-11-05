export interface PermissionOption {
 id: string;
 key: string;
 description: string;
}

export interface PermissionItem extends PermissionOption {
 label: string;
}

export interface PermissionGroup {
 name: string;
 items: PermissionItem[];
}

const GROUPS: { name: string; labels: Record<string, string> }[] = [
 {
  name: 'Clients',
  labels: {
   'clients:all-records': 'See all clients, not only ones assigned to them',
   'clients:assign': 'Assign clients to agents and admins',
   'clients:read': 'View client history',
   'clients:review': 'Review flagged clients',
   'clients:onboard': 'Onboard clients',
   'clients:sessions:revoke': 'Force client logout',
   'clients:analytics:read': 'View client analytics',
  },
 },
 {
  name: 'Loans',
  labels: {
   'loan-requests:read': 'View loan requests',
   'loan-requests:manage': 'Send confirmed loans for approval',
   'loan-requests:confirm-code': "Confirm loans with the client's code",
   'loan-requests:reject': 'Reject loan requests',
   'loan-requests:disburse': 'Send approved loans for disbursement',
   'client-loans:read': 'View client loans',
   'loan-products:manage': 'Manage loan products',
   'management-fees:manage': 'Manage management fees',
   'loan-settings:manage': 'Manage loan settings',
  },
 },
 {
  name: 'Agents',
  labels: {
   'agents:read': 'View agent submissions',
   'agents:review': 'Approve or reject agents',
   'agents:sessions:revoke': 'Force agent logout',
   'agents:onboarding-access:manage': 'Manage agent onboarding access',
   'agents:analytics:read': 'View agent analytics',
   'agents:recruitment:read': 'View recruitment applications',
   'agents:recruitment:analytics:read': 'View recruitment analytics',
   'agents:recruitment:manage': 'Delete abandoned applications',
  },
 },
 {
  name: 'Devices',
  labels: {
   'devices:read': 'View linked devices and release requests',
   'devices:manage': 'Release devices and decide requests',
  },
 },
 {
  name: 'Uploads and reconciliation',
  labels: {
   'ippis:upload': 'Upload IPPIS data',
   'loans:upload': 'Upload disbursed loans',
   'repayments:upload': 'Upload repayment schedule',
   'documents:read': 'View upload batches',
   'reconciliation:read': 'View reconciliation',
  },
 },
 {
  name: 'Wallets',
  labels: {
   'wallets:read': 'View wallets',
   'wallets:manage': 'Credit or debit wallets',
  },
 },
 {
  name: 'Approvals',
  labels: {
   'approvals:loans': 'Decide loan approvals',
   'approvals:agents': 'Decide agent approvals',
   'approvals:wallets': 'Decide wallet changes',
  },
 },
 {
  name: 'Team and access',
  labels: {
   'admins:create': 'Invite admins',
   'roles:manage': 'Manage roles and admins',
   'permissions:manage': 'Manage permission definitions',
   'departments:manage': 'Manage departments',
   'audit:read': 'View audit logs',
   'sessions:manage': 'View and sign out user sessions',
   'alerts:manage': 'Choose who gets security alerts',
   'sectors:manage': 'Add and remove sectors',
  },
 },
];

// Anything the catalog doesn't know lands in "Other" rather than disappearing, so a
// permission added on the server can always be assigned.
export const groupPermissions = (options: PermissionOption[]): PermissionGroup[] => {
 const known = new Set(GROUPS.flatMap((group) => Object.keys(group.labels)));
 const groups = GROUPS.map((group) => ({
  name: group.name,
  items: options
   .filter((option) => option.key in group.labels)
   .map((option) => ({ ...option, label: group.labels[option.key] })),
 }));
 groups.push({
  name: 'Other',
  items: options.filter((option) => !known.has(option.key)).map((option) => ({ ...option, label: option.description || option.key })),
 });
 return groups.filter((group) => group.items.length > 0);
};
