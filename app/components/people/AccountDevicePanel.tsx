"use client";

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Smartphone } from 'lucide-react';
import { devices_api, PrincipalType } from '@/app/api_factory/modules/devices';
import { useDataVersion } from '@/app/composables/useDataVersion';
import { useToast } from '@/app/composables/useToast';
import ReasonDialog from '@/app/dashboard/devices/components/ReasonDialog';

const when = (value?: string | null) => (value ? new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');

/** The phone an agent or client is locked to, with release for admins who may. */
export default function AccountDevicePanel({ principalType, principalId, canManage }: { principalType: PrincipalType; principalId: string; canManage: boolean }) {
 const dataVersion = useDataVersion();
 const { addToast } = useToast();
 const [devices, setDevices] = useState<any[] | null>(null);
 const [releasing, setReleasing] = useState<any>(null);

 const load = useCallback(async () => {
  const res: any = await devices_api.list({ principalType, principalId, limit: 5 });
  if (res?.type !== 'ERROR') setDevices(res.data?.data ?? []);
 }, [principalType, principalId]);

 useEffect(() => { load(); }, [load, dataVersion]);

 if (devices === null) return null;
 const active = devices.find((d) => d.status === 'ACTIVE');
 const previous = devices.filter((d) => d.status !== 'ACTIVE');

 return (
  <div className="bg-card p-6 rounded-2xl border border-border shadow-xs">
   <div className="flex items-center justify-between gap-3 mb-4 pb-2 border-b border-border/60">
    <div className="flex items-center gap-2">
     <Smartphone className="w-4 h-4 text-emerald-600" />
     <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Linked Device</h3>
    </div>
    <Link href="/dashboard/devices" className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">All devices</Link>
   </div>
   {active ? (
    <div className="flex flex-wrap items-start justify-between gap-3">
     <div className="text-sm">
      <span className="block font-semibold text-foreground">{active.description}</span>
      <span className="block text-xs text-muted-foreground">
       {[active.platform === 'ios' ? 'iOS' : active.platform === 'android' ? 'Android' : active.platform, active.osVersion, active.appVersion && `app ${active.appVersion}`].filter(Boolean).join(' · ')}
       {active.imei ? ` · IMEI ${active.imei}` : ''}
      </span>
      <span className="block text-xs text-muted-foreground mt-1">Linked {when(active.boundAt)} · last seen {when(active.lastSeenAt)}</span>
      {active.otherAccountsOnThisDevice > 0 && (
       <span className="block text-xs font-semibold text-amber-800 dark:text-amber-300 mt-1">This phone is also linked to {active.otherAccountsOnThisDevice} other {active.otherAccountsOnThisDevice === 1 ? 'account' : 'accounts'}.</span>
      )}
     </div>
     {canManage && (
      <button type="button" onClick={() => setReleasing(active)} className="h-9 px-3 rounded-lg border border-border text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20">Release device</button>
     )}
    </div>
   ) : (
    <p className="text-sm text-muted-foreground">No phone linked yet. The next phone they sign in on will be linked.</p>
   )}
   {previous.length > 0 && (
    <ul className="mt-4 space-y-1.5">
     {previous.map((d) => (
      <li key={d.id} className="text-xs text-muted-foreground">
       Released {when(d.releasedAt)}: {d.description}{d.releaseReason ? ` — ${d.releaseReason}` : ''}
      </li>
     ))}
    </ul>
   )}
   {releasing && (
    <ReasonDialog
     title="Release this device"
     tone="danger"
     allowProof
     confirmText="Release device"
     description={<>They are signed out everywhere and <b className="text-foreground">{releasing.description}</b> stops working for this account. The next phone they sign in on is linked.</>}
     onCancel={() => setReleasing(null)}
     onConfirm={async (reason, proof) => {
      const res: any = await devices_api.release(releasing.id, reason, proof);
      if (res?.type === 'ERROR') return false;
      addToast('Device released', 'success');
      return true;
     }}
    />
   )}
  </div>
 );
}
