"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { wallets_api, type WalletDirection } from '@/app/api_factory/modules/wallets';
import { addToast } from '@/app/composables/useToast';
import { DIRECTION_META, naira } from './walletFormat';

const REASONS: Record<WalletDirection, string[]> = {
  CREDIT: ['Goodwill credit', 'Correction of a wrong debit', 'Refund of an overpayment received outside payroll'],
  DEBIT: ['Paid out to the client’s bank account', 'Correction of a wrong credit', 'Reversal of a duplicate credit'],
};

export interface WalletActionDialogProps {
  clientId: string;
  clientName?: string | null;
  direction: WalletDirection;
  balance: number;
  /** Balance if every open request is approved, when it differs from the balance. */
  projectedBalance?: number;
  pendingCount?: number;
  onClose: () => void;
  onDone: () => void;
}

/** Credit or debit a client's wallet. Nothing moves until a second admin approves it. */
export default function WalletActionDialog({
  clientId,
  clientName,
  direction: initialDirection,
  balance,
  projectedBalance,
  pendingCount = 0,
  onClose,
  onDone,
}: WalletActionDialogProps) {
  const [direction, setDirection] = useState<WalletDirection>(initialDirection);
  const [amountText, setAmountText] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    amountRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !saving && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, saving]);

  const amount = useMemo(() => Number(amountText.replace(/,/g, '')) || 0, [amountText]);
  const after = direction === 'CREDIT' ? balance + amount : balance - amount;
  const tooBig = direction === 'DEBIT' && amount > balance + 0.005;
  const projectedShort =
    direction === 'DEBIT' && projectedBalance !== undefined && projectedBalance < balance && amount > projectedBalance + 0.005 && !tooBig;
  const valid = amount > 0 && !tooBig && description.trim().length > 0;
  const meta = DIRECTION_META[direction];

  // Digits with thousands separators and at most two decimals, as the admin types.
  const onAmount = (raw: string) => {
    const clean = raw.replace(/[^\d.]/g, '');
    const [whole, ...rest] = clean.split('.');
    const decimals = rest.join('').slice(0, 2);
    const grouped = whole ? Number(whole).toLocaleString('en-NG') : '';
    setAmountText(clean.includes('.') ? `${grouped || '0'}.${decimals}` : grouped);
  };

  const submit = async () => {
    if (!valid || saving) return;
    setSaving(true);
    const res: any = await wallets_api.move(clientId, direction, { amount: Math.round(amount * 100) / 100, description: description.trim() });
    setSaving(false);
    if (res?.type === 'ERROR') return;
    addToast(`${meta.label} of ${naira(amount)} sent for approval`, 'success');
    onDone();
  };

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={`${meta.label} wallet`} className="fixed inset-0 z-modal flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => !saving && onClose()} />
      <div className="relative bg-card rounded-3xl w-full max-w-lg border border-border shadow-2xl max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 p-6 pb-4">
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-foreground">{direction === 'CREDIT' ? 'Credit wallet' : 'Debit wallet'}</h3>
            {clientName && <p className="text-sm text-muted-foreground mt-0.5 truncate">{clientName}</p>}
          </div>
          <button onClick={onClose} disabled={saving} aria-label="Close" className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 space-y-5">
          <div role="tablist" aria-label="Direction" className="grid grid-cols-2 p-1 rounded-xl bg-muted/60">
            {(['CREDIT', 'DEBIT'] as WalletDirection[]).map((d) => {
              const Icon = DIRECTION_META[d].icon;
              const active = d === direction;
              return (
                <button
                  key={d}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setDirection(d)}
                  className={`h-10 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-colors ${
                    active ? (d === 'CREDIT' ? 'bg-[#018752] text-white shadow-sm' : 'bg-rose-600 text-white shadow-sm') : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {d === 'CREDIT' ? 'Add money' : 'Take money out'}
                </button>
              );
            })}
          </div>

          <div>
            <label htmlFor="wallet-amount" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Amount</label>
            <div className={`flex items-center rounded-2xl border bg-background px-4 transition-colors focus-within:ring-2 ${tooBig ? 'border-rose-400 focus-within:ring-rose-200 dark:focus-within:ring-rose-900' : 'border-border focus-within:ring-[#018752]/25 focus-within:border-[#018752]'}`}>
              <span className="text-2xl font-semibold text-muted-foreground mr-1">₦</span>
              <input
                id="wallet-amount"
                ref={amountRef}
                inputMode="decimal"
                autoComplete="off"
                value={amountText}
                onChange={(e) => onAmount(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="0.00"
                className="w-full h-16 bg-transparent text-3xl font-bold text-foreground outline-none placeholder:text-muted-foreground/40 tabular-nums"
              />
            </div>
            {direction === 'DEBIT' && balance > 0 && (
              <button type="button" onClick={() => onAmount(String(balance))} className="mt-1.5 text-xs font-semibold text-[#018752] hover:underline">
                Use the full balance ({naira(balance)})
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Balance now</p>
                <p className="font-semibold text-foreground tabular-nums">{naira(balance)}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="min-w-0 text-right">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">After approval</p>
                <p className={`font-bold tabular-nums ${tooBig ? 'text-rose-600 dark:text-rose-400' : amount > 0 ? meta.amount : 'text-foreground'}`}>
                  {naira(after)}
                </p>
              </div>
            </div>
            {tooBig && (
              <p className="mt-3 flex gap-2 text-xs text-rose-700 dark:text-rose-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                The wallet only holds {naira(balance)}. A debit can’t take it below zero.
              </p>
            )}
            {projectedShort && (
              <p className="mt-3 flex gap-2 text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {pendingCount} other {pendingCount === 1 ? 'request is' : 'requests are'} waiting. If approved first, the wallet will hold {naira(projectedBalance)} and this debit will be refused.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="wallet-description" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Reason</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {REASONS[direction].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setDescription(reason)}
                  className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${description === reason ? 'border-[#018752] bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                >
                  {reason}
                </button>
              ))}
            </div>
            <textarea
              id="wallet-description"
              rows={2}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Shown on the client’s statement and to the approver"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#018752]/30 resize-none"
            />
          </div>

          <p className="flex gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#018752]" />
            Nothing moves yet. Another admin with wallet approval must approve it; you can pick who next.
          </p>
        </div>

        <div className="flex items-center gap-3 justify-end p-6 pt-5">
          <button onClick={onClose} disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-medium text-foreground bg-muted hover:bg-muted/80 transition-colors">Cancel</button>
          <button
            onClick={submit}
            disabled={!valid || saving}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${direction === 'CREDIT' ? 'bg-[#018752] hover:bg-[#016f43]' : 'bg-rose-600 hover:bg-rose-700'}`}
          >
            {saving ? 'Sending…' : amount > 0 ? `Send ${naira(amount)} for approval` : 'Send for approval'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
