/**
 * The server decides which actions a loan request allows right now (by status,
 * and none while a decision waits in Approvals). The page only narrows that
 * list to the actions this admin's permissions cover; it never adds to it.
 */
export const LOAN_ACTION_PERMISSIONS = {
 confirmCode: 'loan-requests:confirm-code',
 approve: 'loan-requests:manage',
 reject: 'loan-requests:reject',
 disburse: 'loan-requests:disburse',
} as const;

export type LoanAction = keyof typeof LOAN_ACTION_PERMISSIONS;

export const allowedLoanActions = (loanRequest: any, can: (permission: string) => boolean): Set<LoanAction> => {
 const offered: string[] = Array.isArray(loanRequest?.availableActions) ? loanRequest.availableActions : [];
 return new Set(
  offered.filter((action): action is LoanAction => action in LOAN_ACTION_PERMISSIONS && can(LOAN_ACTION_PERMISSIONS[action as LoanAction])),
 );
};
