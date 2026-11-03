export const APPROVAL_STATUS_LABELS: Record<string, string> = {
 PENDING: 'Waiting',
 APPROVED: 'Approved',
 REJECTED: 'Rejected',
 CANCELLED: 'Withdrawn',
 FAILED: 'Could not complete',
};

export const APPROVAL_STATUS_STYLES: Record<string, string> = {
 PENDING: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300',
 APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
 REJECTED: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
 CANCELLED: 'bg-muted text-muted-foreground',
 FAILED: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
};

export const formatApprovalDate = (value: string) =>
 new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
