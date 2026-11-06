"use client";

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, BellRing, FileText, Smartphone } from 'lucide-react';
import FilterBar from '@/app/components/ui/FilterBar';
import Pagination from '@/app/components/ui/Pagination';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import TabCount from '@/app/components/ui/TabCount';
import { devices_api } from '@/app/api_factory/modules/devices';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';
import { useDataVersion } from '@/app/composables/useDataVersion';
import { useToast } from '@/app/composables/useToast';
import ReasonDialog from './components/ReasonDialog';

const TH = 'px-4 py-3 text-left text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider whitespace-nowrap';
const when = (value?: string | null) =>
 value ? new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const requestedDevice = (r: any) => [r.requestedBrand, r.requestedModel].filter(Boolean).join(' ') || r.requestedPlatform || null;

function Person({ principal }: { principal: any }) {
 if (!principal) return <span className="text-sm text-muted-foreground">Removed account</span>;
 const href = principal.type === 'AGENT' ? `/dashboard/agent/${principal.id}` : `/dashboard/clients/${principal.id}`;
 return (
  <span className="block min-w-0">
   <Link href={href} className="block text-sm font-medium text-foreground hover:text-[#018752] hover:underline truncate">{principal.name}</Link>
   <span className="block text-xs text-muted-foreground">
    {principal.type === 'AGENT' ? 'Agent' : 'Client'}
    {principal.ippisNumber ? ` · ${principal.ippisNumber}` : ''}
    {principal.phone ? ` · ${principal.phone}` : ''}
   </span>
  </span>
 );
}

const StatusBadge = ({ status }: { status: string }) => {
 const tone: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300',
  APPROVED: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300',
  ACTIVE: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300',
  REJECTED: 'bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300',
  RELEASED: 'bg-muted text-muted-foreground',
  CANCELLED: 'bg-muted text-muted-foreground',
 };
 const label: Record<string, string> = { PENDING: 'Waiting', APPROVED: 'Approved', REJECTED: 'Rejected', ACTIVE: 'Linked', RELEASED: 'Released', CANCELLED: 'Cancelled' };
 return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${tone[status] ?? 'bg-muted text-muted-foreground'}`}>{label[status] ?? status}</span>;
};

type Dialog =
 | { kind: 'approve' | 'reject'; request: any }
 | { kind: 'release'; device: any }
 | null;

function DevicesTabs() {
 const dataVersion = useDataVersion();
 const { isSuperAdmin, hasPermission } = useAdminPermissions();
 const canRead = isSuperAdmin || hasPermission('devices:read');
 const canManage = isSuperAdmin || hasPermission('devices:manage');
 const { addToast } = useToast();
 const requestedTab = useSearchParams().get('tab');
 const [tab, setTab] = useState<'requests' | 'devices'>(requestedTab === 'devices' ? 'devices' : 'requests');
 const [dialog, setDialog] = useState<Dialog>(null);

 // Release requests
 const [reqStatus, setReqStatus] = useState('PENDING');
 const [reqPage, setReqPage] = useState(1);
 const [reqLimit, setReqLimit] = useState(25);
 const [requests, setRequests] = useState<any[]>([]);
 const [reqTotal, setReqTotal] = useState<number | undefined>();
 const [reqState, setReqState] = useState<'loading' | 'ready' | 'error'>('loading');

 // Devices
 const [search, setSearch] = useState('');
 const [principalType, setPrincipalType] = useState('');
 const [status, setStatus] = useState('ACTIVE');
 const [page, setPage] = useState(1);
 const [limit, setLimit] = useState(25);
 const [devices, setDevices] = useState<any[]>([]);
 const [total, setTotal] = useState<number | undefined>();
 const [devState, setDevState] = useState<'loading' | 'ready' | 'error'>('loading');

 const loadRequests = useCallback(async () => {
  const res: any = await devices_api.releaseRequests({ status: reqStatus && reqStatus !== 'none' ? reqStatus : undefined, page: reqPage, limit: reqLimit });
  if (res?.type === 'ERROR') return setReqState('error');
  setRequests(res.data?.data ?? []);
  setReqTotal(res.data?.meta?.total ?? 0);
  setReqState('ready');
 }, [reqStatus, reqPage, reqLimit]);

 const loadDevices = useCallback(async () => {
  const res: any = await devices_api.list({
   page,
   limit,
   q: search.trim() || undefined,
   principalType: principalType && principalType !== 'none' ? (principalType as 'AGENT' | 'CLIENT') : undefined,
   status: status && status !== 'none' ? (status as 'ACTIVE' | 'RELEASED') : undefined,
  });
  if (res?.type === 'ERROR') return setDevState('error');
  setDevices(res.data?.data ?? []);
  setTotal(res.data?.meta?.total ?? 0);
  setDevState('ready');
 }, [page, limit, search, principalType, status]);

 useEffect(() => { if (canRead) loadRequests(); }, [canRead, loadRequests, dataVersion]);
 useEffect(() => { if (canRead) loadDevices(); }, [canRead, loadDevices, dataVersion]);

 const openProof = async (kind: 'device' | 'request', id: string) => {
  const res: any = kind === 'device' ? await devices_api.deviceProof(id) : await devices_api.requestProof(id);
  if (res?.type !== 'ERROR' && res.data?.url) window.open(res.data.url, '_blank', 'noopener');
 };

 const testPush = async (device: any) => {
  const res: any = await devices_api.testPush(device.id);
  if (res?.type === 'ERROR') return;
  const result = res.data?.result;
  const message: Record<string, [string, 'success' | 'info' | 'error']> = {
   sent: ['Test notification sent', 'success'],
   'not-configured': ['Push is not set up on the server yet (FCM credentials missing)', 'info'],
   'no-push-token': ['This device has not given a push token yet', 'info'],
   failed: ['The push failed. The app may have been removed from the device.', 'error'],
  };
  const [text, tone] = message[result] ?? ['Push result: ' + result, 'info'];
  addToast(text, tone);
 };

 if (!canRead) return <EmptyState title="Access Restricted" description="You do not have permission to view devices." />;

 const tabs = [
  { id: 'requests' as const, label: 'Release Requests', count: reqTotal },
  { id: 'devices' as const, label: 'Linked Devices', count: total },
 ];

 return (
  <main className="space-y-4">
   <p className="text-sm text-muted-foreground max-w-3xl">
    Each agent and client can sign in on one phone only. Signing in on another is refused and the owner is alerted. Release the linked phone here, with a
    reason, so they can link a new one.
   </p>
   <div className="border-b border-border">
    <nav className="-mb-px flex gap-4 sm:gap-8 overflow-x-auto" aria-label="Tabs">
     {tabs.map((t) => (
      <button
       key={t.id}
       onClick={() => setTab(t.id)}
       aria-current={tab === t.id ? 'page' : undefined}
       className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
      >
       {t.label}
       <TabCount count={t.count} active={tab === t.id} />
      </button>
     ))}
    </nav>
   </div>

   {tab === 'requests' && (
    <>
     <FilterBar
      onChange={() => setReqPage(1)}
      filters={[{
       key: 'status', label: 'Status', type: 'select', value: reqStatus, emptyValue: 'none',
       options: [{ value: 'PENDING', label: 'Waiting' }, { value: 'APPROVED', label: 'Approved' }, { value: 'REJECTED', label: 'Rejected' }],
       onChange: setReqStatus,
      }]}
     />
     {reqState === 'loading' && <PulseLoader />}
     {reqState === 'error' && <p className="text-red-600 py-12 text-center">Could not load release requests.</p>}
     {reqState === 'ready' && (
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
       <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
         <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
          <tr>
           <th scope="col" className={`pin-start ${TH}`}>Who</th>
           <th scope="col" className={TH}>Linked phone → asked for</th>
           <th scope="col" className={TH}>Their reason</th>
           <th scope="col" className={TH}>Asked</th>
           <th scope="col" className={TH}>Status</th>
           <th scope="col" aria-label="Actions" className={`pin-end ${TH}`}></th>
          </tr>
         </thead>
         <tbody className="divide-y divide-border">
          {requests.length === 0 && (
           <tr><td colSpan={6} className="p-8"><div className="flex justify-center"><EmptyState title={reqStatus === 'PENDING' ? 'No one is waiting for a device release.' : 'No requests found.'} /></div></td></tr>
          )}
          {requests.map((r) => (
           <tr key={r.id} className="hover:bg-muted/30 transition-colors align-top">
            <td className="pin-start px-4 py-3 max-w-[220px]"><Person principal={r.principal} /></td>
            <td className="px-4 py-3 text-sm">
             <span className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-foreground"><Smartphone className="w-4 h-4 text-muted-foreground" />{r.device?.description ?? 'No linked device'}</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{requestedDevice(r) ?? <span className="text-muted-foreground">Any new phone</span>}</span>
             </span>
             {r.decisionReason && <span className="block mt-1 text-xs text-muted-foreground">Decision: {r.decisionReason}</span>}
            </td>
            <td className="px-4 py-3 text-sm text-foreground max-w-[240px]">{r.reason || <span className="text-muted-foreground">None given</span>}</td>
            <td className="px-4 py-3 text-xs text-foreground whitespace-nowrap">{when(r.createdAt)}</td>
            <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={r.status} /></td>
            <td className="pin-end px-4 py-3 text-right whitespace-nowrap">
             {r.status === 'PENDING' && canManage && (
              <>
               <button type="button" onClick={() => setDialog({ kind: 'approve', request: r })} className="h-10 px-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg">Approve</button>
               <button type="button" onClick={() => setDialog({ kind: 'reject', request: r })} className="h-10 px-3 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg">Reject</button>
              </>
             )}
             {r.proofKey && (
              <button type="button" onClick={() => openProof('request', r.id)} className="h-10 px-3 inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:bg-muted/50 rounded-lg"><FileText className="w-4 h-4" /> Proof</button>
             )}
            </td>
           </tr>
          ))}
         </tbody>
        </table>
       </div>
       {requests.length > 0 && (
        <div className="border-t border-border/50 py-4 px-4">
         <Pagination totalItems={reqTotal ?? 0} currentPage={reqPage} itemsPerPage={reqLimit} onPageChange={setReqPage} onItemsPerPageChange={(v) => { setReqLimit(v); setReqPage(1); }} />
        </div>
       )}
      </div>
     )}
    </>
   )}

   {tab === 'devices' && (
    <>
     <FilterBar
      onChange={() => setPage(1)}
      search={{ value: search, onChange: setSearch, placeholder: 'Name, phone, email or IPPIS' }}
      filters={[
       { key: 'status', label: 'Status', type: 'select', value: status, emptyValue: 'none', options: [{ value: 'ACTIVE', label: 'Linked' }, { value: 'RELEASED', label: 'Released' }], onChange: setStatus },
       { key: 'type', label: 'Account', type: 'select', value: principalType, emptyValue: 'none', options: [{ value: 'AGENT', label: 'Agents' }, { value: 'CLIENT', label: 'Clients' }], onChange: setPrincipalType },
      ]}
     />
     {devState === 'loading' && <PulseLoader />}
     {devState === 'error' && <p className="text-red-600 py-12 text-center">Could not load devices.</p>}
     {devState === 'ready' && (
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
       <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
         <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
          <tr>
           <th scope="col" className={`pin-start ${TH}`}>Who</th>
           <th scope="col" className={TH}>Device</th>
           <th scope="col" className={TH}>IMEI</th>
           <th scope="col" className={TH}>Linked</th>
           <th scope="col" className={TH}>Last seen</th>
           <th scope="col" className={TH}>Status</th>
           <th scope="col" aria-label="Actions" className={`pin-end ${TH}`}></th>
          </tr>
         </thead>
         <tbody className="divide-y divide-border">
          {devices.length === 0 && (
           <tr><td colSpan={7} className="p-8"><div className="flex justify-center"><EmptyState title="No devices found." /></div></td></tr>
          )}
          {devices.map((d) => (
           <tr key={d.id} className="hover:bg-muted/30 transition-colors align-top">
            <td className="pin-start px-4 py-3 max-w-[220px]"><Person principal={d.principal} /></td>
            <td className="px-4 py-3">
             <span className="block text-sm text-foreground">{d.description}</span>
             <span className="block text-xs text-muted-foreground">
              {[d.platform === 'ios' ? 'iOS' : d.platform === 'android' ? 'Android' : d.platform, d.osVersion, d.appVersion && `app ${d.appVersion}`].filter(Boolean).join(' · ') || '—'}
             </span>
             {d.otherAccountsOnThisDevice > 0 && (
              <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-amber-800 dark:text-amber-300">
               <AlertTriangle className="w-3.5 h-3.5" /> Also linked to {d.otherAccountsOnThisDevice} other {d.otherAccountsOnThisDevice === 1 ? 'account' : 'accounts'}
              </span>
             )}
            </td>
            <td className="px-4 py-3 text-xs font-mono text-muted-foreground whitespace-nowrap">{d.imei ?? '—'}</td>
            <td className="px-4 py-3 text-xs text-foreground whitespace-nowrap">{when(d.boundAt)}</td>
            <td className="px-4 py-3 text-xs text-foreground whitespace-nowrap">{when(d.lastSeenAt)}</td>
            <td className="px-4 py-3">
             <StatusBadge status={d.status} />
             {d.status === 'RELEASED' && d.releaseReason && <span className="block mt-1 text-xs text-muted-foreground max-w-[200px]">{d.releaseReason}</span>}
            </td>
            <td className="pin-end px-4 py-3 text-right whitespace-nowrap">
             {d.status === 'ACTIVE' && canManage && (
              <>
               {d.hasPushToken && (
                <button type="button" onClick={() => testPush(d)} title="Send a test notification" className="h-10 px-3 inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:bg-muted/50 rounded-lg"><BellRing className="w-4 h-4" /> Test push</button>
               )}
               <button type="button" onClick={() => setDialog({ kind: 'release', device: d })} className="h-10 px-3 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg">Release</button>
              </>
             )}
             {d.hasReleaseProof && (
              <button type="button" onClick={() => openProof('device', d.id)} className="h-10 px-3 inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:bg-muted/50 rounded-lg"><FileText className="w-4 h-4" /> Proof</button>
             )}
            </td>
           </tr>
          ))}
         </tbody>
        </table>
       </div>
       {devices.length > 0 && (
        <div className="border-t border-border/50 py-4 px-4">
         <Pagination totalItems={total ?? 0} currentPage={page} itemsPerPage={limit} onPageChange={setPage} onItemsPerPageChange={(v) => { setLimit(v); setPage(1); }} />
        </div>
       )}
      </div>
     )}
    </>
   )}

   {dialog?.kind === 'approve' && (
    <ReasonDialog
     title="Approve device release"
     allowProof
     confirmText="Release and approve"
     description={
      <>
       {dialog.request.principal?.name ?? 'This account'} is signed out everywhere and their phone <b className="text-foreground">{dialog.request.device?.description ?? ''}</b> is removed.
       {requestedDevice(dialog.request) ? <> <b className="text-foreground">{requestedDevice(dialog.request)}</b>, the phone they asked from, is linked straight away.</> : ' The next phone they sign in on is linked.'}
      </>
     }
     onCancel={() => setDialog(null)}
     onConfirm={async (reason, proof) => {
      const res: any = await devices_api.approveRequest(dialog.request.id, reason, proof);
      if (res?.type === 'ERROR') return false;
      addToast('Device released and request approved', 'success');
      return true;
     }}
    />
   )}
   {dialog?.kind === 'reject' && (
    <ReasonDialog
     title="Reject device release"
     tone="danger"
     confirmText="Reject request"
     description={<>Their current phone stays linked. Say why, so they know what to do next.</>}
     onCancel={() => setDialog(null)}
     onConfirm={async (reason) => {
      const res: any = await devices_api.rejectRequest(dialog.request.id, reason);
      if (res?.type === 'ERROR') return false;
      addToast('Request rejected', 'success');
      return true;
     }}
    />
   )}
   {dialog?.kind === 'release' && (
    <ReasonDialog
     title="Release this device"
     tone="danger"
     allowProof
     confirmText="Release device"
     description={<>{dialog.device.principal?.name ?? 'The owner'} is signed out everywhere and <b className="text-foreground">{dialog.device.description}</b> stops working for their account. The next phone they sign in on is linked. They are told by {dialog.device.principalType === 'AGENT' ? 'email' : 'text'}.</>}
     onCancel={() => setDialog(null)}
     onConfirm={async (reason, proof) => {
      const res: any = await devices_api.release(dialog.device.id, reason, proof);
      if (res?.type === 'ERROR') return false;
      addToast('Device released', 'success');
      return true;
     }}
    />
   )}
  </main>
 );
}

export default function DevicesPage() {
 return (
  <Suspense>
   <DevicesTabs />
  </Suspense>
 );
}
