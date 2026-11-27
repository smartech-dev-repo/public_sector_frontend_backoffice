"use client";

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowDownLeft, ArrowUpRight, Clock, ExternalLink, Wallet } from 'lucide-react';
import { wallets_api, type WalletDirection } from '@/app/api_factory/modules/wallets';
import FilterBar, { dateRangeParams } from '@/app/components/ui/FilterBar';
import Pagination from '@/app/components/ui/Pagination';
import PulseLoader from '@/app/components/ui/PulseLoader';
import { useDataVersion } from '@/app/composables/useDataVersion';
import WalletActionDialog from './WalletActionDialog';
import { DIRECTION_META, SOURCE_META, SOURCE_OPTIONS, TH, actorLabel, dateTime, naira } from './walletFormat';

interface Props {
  clientId: string;
  clientName?: string | null;
  canManage: boolean;
}

/** A client's wallet: balance, open requests, and the full statement with the balance after each line. */
export default function ClientWalletPanel({ clientId, clientName, canManage }: Props) {
  const dataVersion = useDataVersion();
  const [wallet, setWallet] = useState<any>(null);
  const [failed, setFailed] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({ direction: '', source: '', range: '' });
  const [action, setAction] = useState<WalletDirection | null>(null);

  const load = useCallback(async () => {
    const params: Record<string, unknown> = { page, limit, ...dateRangeParams(filters.range, 'createdFrom', 'createdTo') };
    if (filters.direction) params.direction = filters.direction;
    if (filters.source) params.source = filters.source;
    const res: any = await wallets_api.getClientWallet(clientId, params);
    if (res?.type === 'ERROR') setFailed(true);
    else {
      setWallet(res.data);
      setFailed(false);
    }
  }, [clientId, page, limit, filters]);

  useEffect(() => {
    load();
  }, [load, dataVersion]);

  if (!wallet) {
    return failed ? (
      <div className="bg-card p-6 rounded-2xl border border-border text-sm text-muted-foreground">The wallet couldn’t be loaded. Try again shortly.</div>
    ) : (
      <div className="py-12"><PulseLoader /></div>
    );
  }

  const entries = wallet.entries?.data ?? [];
  const pending: any[] = wallet.pending ?? [];
  const filtered = Boolean(filters.direction || filters.source || filters.range);
  const projected = wallet.projectedBalance ?? wallet.balance;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#016f43] via-[#018752] to-[#02a565] p-6 text-white shadow-sm">
          <Wallet className="absolute -right-6 -bottom-8 w-40 h-40 text-white/10" aria-hidden />
          <p className="text-xs font-semibold uppercase tracking-wider text-white/80">Available balance</p>
          <p className="mt-1 text-4xl font-bold tabular-nums">{naira(wallet.balance)}</p>
          {pending.length > 0 && Math.abs(projected - wallet.balance) > 0.005 && (
            <p className="mt-1 text-sm text-white/85">
              {naira(projected)} once {pending.length === 1 ? 'the open request is' : `all ${pending.length} open requests are`} approved
            </p>
          )}
          {canManage && (
            <div className="relative mt-5 flex flex-wrap gap-2">
              <button onClick={() => setAction('CREDIT')} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#016f43] hover:bg-white/90 transition-colors">
                <ArrowDownLeft className="w-4 h-4" />Credit
              </button>
              <button
                onClick={() => setAction('DEBIT')}
                disabled={wallet.balance <= 0}
                title={wallet.balance <= 0 ? 'The wallet is empty' : undefined}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-inset ring-white/40 hover:bg-white/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowUpRight className="w-4 h-4" />Debit
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Stat label="Total credited" value={naira(wallet.totals?.credited)} tone={wallet.totals?.credited > 0 ? 'emerald' : undefined} />
          <Stat label="Total debited" value={naira(wallet.totals?.debited)} tone={wallet.totals?.debited > 0 ? 'rose' : undefined} />
          <Stat label="Movements" value={(wallet.totals?.entries ?? 0).toLocaleString()} />
          <Stat label="Waiting for approval" value={pending.length.toLocaleString()} tone={pending.length ? 'amber' : undefined} />
        </div>
      </div>

      {pending.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/20">
          <div className="flex items-center justify-between gap-3 px-4 pt-3.5">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-900 dark:text-amber-300">
              <Clock className="w-4 h-4" />Waiting for approval
            </p>
            <Link href="/dashboard/approvals" className="text-xs font-semibold text-amber-900 dark:text-amber-300 hover:underline">All approvals</Link>
          </div>
          <ul className="divide-y divide-amber-200/70 dark:divide-amber-900/40">
            {pending.map((p) => {
              const meta = DIRECTION_META[p.direction as WalletDirection];
              const Icon = meta.icon;
              return (
                <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <span className={`grid place-items-center w-8 h-8 rounded-full shrink-0 ${meta.chip}`}><Icon className="w-4 h-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate" title={p.description ?? ''}>{p.description ?? meta.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {meta.label} requested by {p.requestedBy?.fullName ?? 'an admin'} · {dateTime(p.createdAt)}
                      {p.assignedTo?.fullName ? ` · with ${p.assignedTo.fullName}` : ''}
                    </p>
                  </div>
                  <span className={`text-sm font-bold tabular-nums whitespace-nowrap ${meta.amount}`}>{naira(p.direction === 'DEBIT' ? -p.amount : p.amount, { sign: true })}</span>
                  <Link href={`/dashboard/approvals/${p.id}`} aria-label="Open approval" className="text-muted-foreground hover:text-foreground"><ExternalLink className="w-4 h-4" /></Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div>
        <div className="flex flex-wrap items-end justify-between gap-2 mb-3">
          <h3 className="text-base font-semibold text-foreground">Statement</h3>
        </div>
        <FilterBar
          onChange={() => setPage(1)}
          filters={[
            { key: 'direction', label: 'Type', type: 'select', value: filters.direction, options: [{ value: 'CREDIT', label: 'Credits' }, { value: 'DEBIT', label: 'Debits' }], onChange: (direction) => setFilters({ ...filters, direction }) },
            { key: 'source', label: 'Source', type: 'select', value: filters.source, options: SOURCE_OPTIONS, onChange: (source) => setFilters({ ...filters, source }) },
            { key: 'range', label: 'Date', type: 'dateRange', value: filters.range, onChange: (range) => setFilters({ ...filters, range }) },
          ]}
        />
        <div className="mt-3 bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full text-left border-collapse">
              <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
                <tr>
                  <th className={`pin-start ${TH}`}>Date</th>
                  <th className={TH}>Details</th>
                  <th className={TH}>By</th>
                  <th className={`${TH} text-right`}>Amount</th>
                  <th className={`${TH} text-right`}>Balance after</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-sm text-foreground">
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                      {filtered ? 'No movements match these filters.' : 'No money has moved in or out of this wallet yet.'}
                    </td>
                  </tr>
                ) : (
                  entries.map((e: any) => <EntryRow key={e.id} entry={e} />)
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-3">
          <Pagination totalItems={wallet.entries?.meta?.total || 0} currentPage={page} itemsPerPage={limit} onPageChange={setPage} onItemsPerPageChange={setLimit} />
        </div>
      </div>

      {action && (
        <WalletActionDialog
          clientId={clientId}
          clientName={clientName}
          direction={action}
          balance={wallet.balance}
          projectedBalance={projected}
          pendingCount={pending.length}
          onClose={() => setAction(null)}
          onDone={() => {
            setAction(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function EntryRow({ entry }: { entry: any }) {
  const meta = DIRECTION_META[entry.direction as WalletDirection];
  const source = SOURCE_META[entry.source as keyof typeof SOURCE_META] ?? SOURCE_META.MANUAL;
  const Icon = meta.icon;
  return (
    <tr className="hover:bg-muted/20 transition-colors">
      <td className="pin-start px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{dateTime(entry.createdAt)}</td>
      <td className="px-4 py-3.5 min-w-[16rem]">
        <div className="flex items-start gap-2.5">
          <span className={`mt-0.5 grid place-items-center w-7 h-7 rounded-full shrink-0 ${meta.chip}`}><Icon className="w-3.5 h-3.5" /></span>
          <div className="min-w-0">
            <p className="font-medium text-foreground line-clamp-2" title={entry.description}>{entry.description}</p>
            <span title={source.hint} className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${source.className}`}>
              <source.icon className="w-3 h-3" />{source.label}
            </span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{actorLabel(entry)}</td>
      <td className={`px-4 py-3.5 text-right font-semibold tabular-nums whitespace-nowrap ${meta.amount}`}>
        {naira(entry.direction === 'DEBIT' ? -entry.amount : entry.amount, { sign: true })}
      </td>
      <td className="px-4 py-3.5 text-right tabular-nums whitespace-nowrap text-foreground/80">{naira(entry.balanceAfter)}</td>
    </tr>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'emerald' | 'rose' | 'amber' }) {
  const tones = {
    emerald: 'text-emerald-700 dark:text-emerald-400',
    rose: 'text-rose-700 dark:text-rose-400',
    amber: 'text-amber-700 dark:text-amber-400',
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-4 min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 text-lg font-bold tabular-nums truncate ${tone ? tones[tone] : 'text-foreground'}`} title={value}>{value}</p>
    </div>
  );
}
