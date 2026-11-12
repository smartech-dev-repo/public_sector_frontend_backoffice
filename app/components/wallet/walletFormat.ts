import { ArrowDownLeft, ArrowUpRight, Banknote, HandCoins, Landmark, Undo2, type LucideIcon } from 'lucide-react';
import type { WalletDirection, WalletSource } from '@/app/api_factory/modules/wallets';

export const naira = (value: unknown, opts: { sign?: boolean } = {}) => {
  const n = Number(value || 0);
  const text = `₦${Math.abs(n).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (opts.sign) return `${n < 0 ? '−' : '+'}${text}`;
  return n < 0 ? `−${text}` : text;
};

export const dateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    : '—';

export const dateOnly = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const SOURCE_META: Record<WalletSource, { label: string; hint: string; icon: LucideIcon; className: string }> = {
  MANUAL: {
    label: 'Admin adjustment',
    hint: 'Credited or debited by an admin and approved by another',
    icon: Landmark,
    className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700',
  },
  LOAN_OVERPAYMENT: {
    label: 'Loan overpayment',
    hint: 'Payroll deducted more than the month’s installment',
    icon: HandCoins,
    className: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900',
  },
  DEDUCTION_REFUND: {
    label: 'Deduction refund',
    hint: 'A payroll deduction with no running loan, refunded',
    icon: Undo2,
    className: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-900',
  },
  LOAN_REPAYMENT: {
    label: 'Paid toward loan',
    hint: 'The client used their wallet to pay down their loan',
    icon: Banknote,
    className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
  },
};

export const SOURCE_OPTIONS = (Object.keys(SOURCE_META) as WalletSource[]).map((value) => ({ value, label: SOURCE_META[value].label }));

export const DIRECTION_META: Record<WalletDirection, { label: string; icon: LucideIcon; amount: string; chip: string }> = {
  CREDIT: {
    label: 'Credit',
    icon: ArrowDownLeft,
    amount: 'text-emerald-700 dark:text-emerald-400',
    chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  },
  DEBIT: {
    label: 'Debit',
    icon: ArrowUpRight,
    amount: 'text-rose-700 dark:text-rose-400',
    chip: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  },
};

/** Who made the movement, as one short line. */
export const actorLabel = (entry: { actorType?: string; actor?: any }) => {
  if (entry.actorType === 'SYSTEM') return 'System';
  if (entry.actorType === 'CLIENT') return 'Client (app)';
  return entry.actor?.fullName ?? entry.actor?.email ?? (entry.actorType === 'AGENT' ? 'Agent' : 'Admin');
};

export const TH = 'px-4 py-3.5 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider whitespace-nowrap';
