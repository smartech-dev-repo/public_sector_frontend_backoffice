import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractErrorMessage(e: any, defaultMessage: string = 'An error occurred'): string {
  const errorData = e?.response?.data;
  if (errorData?.details && Array.isArray(errorData.details)) {
    const detailsMsg = errorData.details
      .map((d: any) => d.constraints?.join(', ') || d.message)
      .filter(Boolean)
      .join(' | ');
    if (detailsMsg) {
      return `${errorData.error}: ${detailsMsg}`;
    }
  }
  return errorData?.error || e?.message || defaultMessage;
}

export function formatInvestmentStatus(status?: string, instrumentType?: string): string {
  if (!status) return 'Unknown';
  const s = status.toLowerCase();
  if (s === 'active') return 'Running';
  if (s === 'withdrawn_early' || s === 'withdraw_early') return 'Terminated';
  if (s === 'completed') return 'Matured';
  if (s === 'cancelled') return 'Cancelled';
  if (s === 'partially_liquidated') return 'Partially Liquidated';
  if (s === 'withdrawal_requested') return 'Withdrawal Requested';
  if (s === 'processing') return 'Processing';
  if (s === 'rolled_over') return 'Top Up';
  if (s === 'withdrawn') {
    if (instrumentType && ['BOND', 'EQUITY'].includes(instrumentType.toUpperCase())) {
      return 'Disposed';
    }
    return 'Withdrawn';
  }
  return status.replace(/_/g, ' ');
}

