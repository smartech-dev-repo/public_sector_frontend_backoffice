"use client";

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowDownLeft, ArrowUpRight, Clock, Wallet } from 'lucide-react';
import { wallets_api, type WalletDirection, type WalletSource } from '@/app/api_factory/modules/wallets';
import FilterBar, { dateRangeParams } from '@/app/components/ui/FilterBar';
import Pagination from '@/app/components/ui/Pagination';
import PulseLoader from '@/app/components/ui/PulseLoader';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';
import { useDataVersion } from '@/app/composables/useDataVersion';
import WalletActionDialog from '@/app/components/wallet/WalletActionDialog';
import { DIRECTION_META, SOURCE_META, SOURCE_OPTIONS, TH, actorLabel, dateOnly, dateTime, naira } from '@/app/components/wallet/walletFormat';

type Tab = 'wallets' | 'transactions';

export default function WalletsPage() {
  const { isSuperAdmin, hasPermission } = useAdminPermissions();
  const canRead = isSuperAdmin || hasPermission('wallets:read');
  const canManage = isSuperAdmin || hasPermission('wallets:manage');
  const [tab, setTab] = useState<Tab>('wallets');
  const [summary, setSummary] = useState<any>(null);

  if (!canRead) {
    return (
      <div className="p-6 text-sm text-muted-foreground">You need the wallets:read permission to see client wallets.</div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Wallets</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Money held for clients: overpayments, refunded deductions and admin adjustments, and what they used to pay down loans.
          </p>
        </div>
      </div>

      <SummaryCards summary={summary} />

      <div role="tablist" className="flex gap-1 border-b border-border">
        {(['wallets', 'transactions'] as Tab[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === t ? 'border-[#018752] text-[#018752]' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {t === 'wallets' ? 'Wallets' : 'Transactions'}
          </button>
        ))}
      </div>

      {tab === 'wallets' ? <WalletsTab canManage={canManage} onSummary={setSummary} /> : <TransactionsTab />}
      {tab === 'transactions' && !summary && <SummaryLoader onSummary={setSummary} />}
    </div>
  );
}

/** The transactions tab doesn't load the summary itself; fetch it once if it isn't there yet. */
function SummaryLoader({ onSummary }: { onSummary: (s: any) => void }) {
  useEffect(() => {
    wallets_api.getWallets({ limit: 1 }).then((res: any) => res?.type !== 'ERROR' && onSummary(res.data?.summary));
  }, [onSummary]);
  return null;
}

function SummaryCards({ summary }: { summary: any }) {
  if (!summary) {
    return <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[0, 1, 2, 3].map((i) => <div key={i} className="h-28 rounded-2xl bg-muted/40 animate-pulse" />)}</div>;
  }
  const period = summary.period ?? {};
  const bySource: Record<WalletSource, { credited: number; debited: number; count: number }> = period.bySource ?? {};
  const monthLabel = period.from ? new Date(period.from).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' }) : 'This month';
  const flows = (Object.keys(SOURCE_META) as WalletSource[])
    .map((source) => ({ source, amount: (bySource[source]?.credited ?? 0) + (bySource[source]?.debited ?? 0), ...bySource[source] }))
    .filter((f) => f.amount > 0);
  const maxFlow = Math.max(1, ...flows.map((f) => f.amount));

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#016f43] via-[#018752] to-[#02a565] p-5 text-white">
          <Wallet className="absolute -right-4 -bottom-6 w-32 h-32 text-white/10" aria-hidden />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/80">Held in client wallets</p>
          <p className="mt-1 text-3xl font-bold tabular-nums">{naira(summary.totalHeld)}</p>
          <p className="mt-1 text-sm text-white/85">
            {summary.walletsWithBalance.toLocaleString()} of {summary.wallets.toLocaleString()} {summary.wallets === 1 ? 'wallet holds' : 'wallets hold'} money
          </p>
        </div>
        <Card label={`Credited · ${monthLabel}`} value={naira(period.credited)} tone="emerald" icon={ArrowDownLeft} />
        <Card label={`Debited · ${monthLabel}`} value={naira(period.debited)} tone="rose" icon={ArrowUpRight} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Where the money came from</p>
            <p className="text-xs text-muted-foreground">{monthLabel}, by source</p>
          </div>
          <Link
            href="/dashboard/approvals"
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${summary.pendingRequests ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300' : 'bg-muted text-muted-foreground'}`}
          >
            <Clock className="w-3.5 h-3.5" />
            {summary.pendingRequests} waiting for approval
          </Link>
        </div>
        {flows.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">No money has moved this month.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {flows.map((f) => {
              const meta = SOURCE_META[f.source];
              return (
                <li key={f.source}>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 font-medium text-foreground"><meta.icon className="w-3.5 h-3.5 text-muted-foreground" />{meta.label}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {f.credited ? <span className="text-emerald-700 dark:text-emerald-400">+{naira(f.credited)}</span> : null}
                      {f.credited && f.debited ? ' · ' : ''}
                      {f.debited ? <span className="text-rose-700 dark:text-rose-400">−{naira(f.debited)}</span> : null}
                    </span>
                  </div>
                  <div className="mt-1 flex h-2 rounded-full bg-muted overflow-hidden" role="img" aria-label={`${meta.label}: ${naira(f.amount)} moved`}>
                    <div className="h-full bg-emerald-500" style={{ width: `${(f.credited / maxFlow) * 100}%` }} />
                    <div className="h-full bg-rose-500" style={{ width: `${(f.debited / maxFlow) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function Card({ label, value, tone, icon: Icon }: { label: string; value: string; tone: 'emerald' | 'rose'; icon: typeof Wallet }) {
  const tones = {
    emerald: 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60',
    rose: 'text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60',
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-4 min-w-0">
      <span className={`grid place-items-center w-8 h-8 rounded-full ${tones[tone]}`}><Icon className="w-4 h-4" /></span>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate">{label}</p>
      <p className="mt-0.5 text-lg font-bold tabular-nums text-foreground truncate" title={value}>{value}</p>
    </div>
  );
}

function WalletsTab({ canManage, onSummary }: { canManage: boolean; onSummary: (s: any) => void }) {
  const dataVersion = useDataVersion();
  const [rows, setRows] = useState<any[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ balance: '', sort: 'balance' });
  const [action, setAction] = useState<{ row: any; direction: WalletDirection } | null>(null);

  const load = useCallback(async () => {
    const params: Record<string, unknown> = { page, limit, sort: filters.sort };
    if (filters.balance) params.balance = filters.balance;
    if (search) params.search = search;
    const res: any = await wallets_api.getWallets(params);
    if (res?.type === 'ERROR') return setRows((r) => r ?? []);
    setRows(res.data?.data ?? []);
    setTotal(res.data?.meta?.total ?? 0);
    onSummary(res.data?.summary ?? null);
  }, [page, limit, filters, search, onSummary]);

  useEffect(() => {
    load();
  }, [load, dataVersion]);

  return (
    <div className="space-y-3">
      <FilterBar
        onChange={() => setPage(1)}
        search={{ value: search, onChange: setSearch, placeholder: 'Name, phone or staff ID' }}
        filters={[
          { key: 'balance', label: 'Balance', type: 'select', value: filters.balance, options: [{ value: 'POSITIVE', label: 'Holds money' }, { value: 'ZERO', label: 'Empty' }], onChange: (balance) => setFilters({ ...filters, balance }) },
          { key: 'sort', label: 'Sort', type: 'select', value: filters.sort, emptyValue: 'balance', options: [{ value: 'balance', label: 'Highest balance' }, { value: 'recent', label: 'Latest movement' }, { value: 'credited', label: 'Most credited' }, { value: 'debited', label: 'Most debited' }], onChange: (sort) => setFilters({ ...filters, sort: sort || 'balance' }) },
        ]}
      />
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full text-left border-collapse">
            <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
              <tr>
                <th className={`pin-start ${TH}`}>Client</th>
                <th className={TH}>Sector</th>
                <th className={`${TH} text-right`}>Balance</th>
                <th className={`${TH} text-right`}>Credited</th>
                <th className={`${TH} text-right`}>Debited</th>
                <th className={TH}>Last movement</th>
                <th className={`pin-end ${TH} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-sm text-foreground">
              {rows === null ? (
                <tr><td colSpan={7} className="py-12"><PulseLoader /></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">{search || filters.balance ? 'No wallets match these filters.' : 'No client has had money in their wallet yet.'}</td></tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.clientId} className="hover:bg-muted/20 transition-colors">
                    <td className="pin-start px-4 py-3.5">
                      <Link href={`/dashboard/clients/${row.clientId}?tab=wallet`} className="font-medium text-foreground hover:text-[#018752] hover:underline">
                        {row.client?.name ?? row.client?.phone ?? 'Client'}
                      </Link>
                      <span className="block text-[11px] text-muted-foreground font-mono">{row.client?.staffId ?? row.client?.phone ?? ''}</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{row.client?.agency ?? '—'}</td>
                    <td className={`px-4 py-3.5 text-right font-bold tabular-nums whitespace-nowrap ${row.balance > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>{naira(row.balance)}</td>
                    <td className={`px-4 py-3.5 text-right tabular-nums whitespace-nowrap ${row.credited > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'}`}>{naira(row.credited)}</td>
                    <td className={`px-4 py-3.5 text-right tabular-nums whitespace-nowrap ${row.debited > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-muted-foreground'}`}>{naira(row.debited)}</td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                      {dateOnly(row.lastEntryAt)}
                      <span className="block text-[11px]">{row.entries} {row.entries === 1 ? 'movement' : 'movements'}</span>
                    </td>
                    <td className="pin-end px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex gap-1.5">
                        {canManage && (
                          <>
                            <button onClick={() => setAction({ row, direction: 'CREDIT' })} className="text-xs px-2.5 py-1 font-medium rounded-lg bg-[#018752] hover:bg-[#016f43] text-white transition-colors">Credit</button>
                            <button onClick={() => setAction({ row, direction: 'DEBIT' })} disabled={row.balance <= 0} className="text-xs px-2.5 py-1 font-medium rounded-lg bg-muted/40 hover:bg-muted/70 text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Debit</button>
                          </>
                        )}
                        <Link href={`/dashboard/clients/${row.clientId}?tab=wallet`} className="text-xs px-2.5 py-1 font-medium rounded-lg bg-muted/40 hover:bg-muted/70 text-foreground transition-colors">Statement</Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination totalItems={total} currentPage={page} itemsPerPage={limit} onPageChange={setPage} onItemsPerPageChange={setLimit} />

      {action && (
        <WalletActionDialog
          clientId={action.row.clientId}
          clientName={action.row.client?.name}
          direction={action.direction}
          balance={action.row.balance}
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

function TransactionsTab() {
  const dataVersion = useDataVersion();
  const [data, setData] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ direction: '', source: '', range: '' });

  const load = useCallback(async () => {
    const params: Record<string, unknown> = { page, limit, ...dateRangeParams(filters.range, 'createdFrom', 'createdTo') };
    if (filters.direction) params.direction = filters.direction;
    if (filters.source) params.source = filters.source;
    if (search) params.search = search;
    const res: any = await wallets_api.getWalletEntries(params);
    if (res?.type !== 'ERROR') setData(res.data);
    else setData((d: any) => d ?? { data: [], meta: { total: 0 }, totals: { credited: 0, debited: 0 } });
  }, [page, limit, filters, search]);

  useEffect(() => {
    load();
  }, [load, dataVersion]);

  const rows: any[] = data?.data ?? [];
  const filtered = Boolean(search || filters.direction || filters.source || filters.range);

  return (
    <div className="space-y-3">
      <FilterBar
        onChange={() => setPage(1)}
        search={{ value: search, onChange: setSearch, placeholder: 'Client name, phone or staff ID' }}
        filters={[
          { key: 'direction', label: 'Type', type: 'select', value: filters.direction, options: [{ value: 'CREDIT', label: 'Credits' }, { value: 'DEBIT', label: 'Debits' }], onChange: (direction) => setFilters({ ...filters, direction }) },
          { key: 'source', label: 'Source', type: 'select', value: filters.source, options: SOURCE_OPTIONS, onChange: (source) => setFilters({ ...filters, source }) },
          { key: 'range', label: 'Date', type: 'dateRange', value: filters.range, onChange: (range) => setFilters({ ...filters, range }) },
        ]}
      />
      {data && (
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <span className="text-muted-foreground">{(data.meta?.total ?? 0).toLocaleString()} {data.meta?.total === 1 ? 'movement' : 'movements'}{filtered ? ' match' : ''}</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold tabular-nums">In {naira(data.totals?.credited)}</span>
          <span className="text-rose-700 dark:text-rose-400 font-semibold tabular-nums">Out {naira(data.totals?.debited)}</span>
        </div>
      )}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full text-left border-collapse">
            <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
              <tr>
                <th className={`pin-start ${TH}`}>Date</th>
                <th className={TH}>Client</th>
                <th className={TH}>Details</th>
                <th className={TH}>By</th>
                <th className={`pin-end ${TH} text-right`}>Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-sm text-foreground">
              {!data ? (
                <tr><td colSpan={5} className="py-12"><PulseLoader /></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">{filtered ? 'No movements match these filters.' : 'No money has moved through any wallet yet.'}</td></tr>
              ) : (
                rows.map((e) => {
                  const meta = DIRECTION_META[e.direction as WalletDirection];
                  const source = SOURCE_META[e.source as WalletSource] ?? SOURCE_META.MANUAL;
                  const Icon = meta.icon;
                  return (
                    <tr key={e.id} className="hover:bg-muted/20 transition-colors">
                      <td className="pin-start px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{dateTime(e.createdAt)}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <Link href={`/dashboard/clients/${e.client?.id}?tab=wallet`} className="font-medium text-foreground hover:text-[#018752] hover:underline">{e.client?.name ?? e.client?.phone ?? 'Client'}</Link>
                        <span className="block text-[11px] text-muted-foreground font-mono">{e.client?.staffId ?? ''}</span>
                      </td>
                      <td className="px-4 py-3.5 min-w-[16rem]">
                        <div className="flex items-start gap-2.5">
                          <span className={`mt-0.5 grid place-items-center w-7 h-7 rounded-full shrink-0 ${meta.chip}`}><Icon className="w-3.5 h-3.5" /></span>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground line-clamp-2" title={e.description}>{e.description}</p>
                            <span title={source.hint} className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${source.className}`}><source.icon className="w-3 h-3" />{source.label}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{actorLabel(e)}</td>
                      <td className={`pin-end px-4 py-3.5 text-right font-semibold tabular-nums whitespace-nowrap ${meta.amount}`}>{naira(e.direction === 'DEBIT' ? -e.amount : e.amount, { sign: true })}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination totalItems={data?.meta?.total || 0} currentPage={page} itemsPerPage={limit} onPageChange={setPage} onItemsPerPageChange={setLimit} />
    </div>
  );
}
