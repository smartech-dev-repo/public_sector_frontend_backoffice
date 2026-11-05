"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import PulseLoader from '@/app/components/ui/PulseLoader';
import { loanEligibility_api } from '@/app/api_factory/modules/loanEligibility';
import { useToast } from '@/app/composables/useToast';
import { useDataVersion } from '@/app/composables/useDataVersion';
import RepaymentCapacityFields, { CapacityForm, capacityFormFrom, capacityPayload, describeCapacity, naira, sameCapacity } from '@/app/dashboard/configuration/components/RepaymentCapacityFields';
import AffordabilityWorkings from './AffordabilityWorkings';

interface Props {
 clientId: string;
 canManage: boolean;
}

/**
 * What this client can borrow or top up over a tenor, how that was worked out, and their own
 * repayment capacity setting. Same layout as Roles: controls on the left, detail on the right.
 */
export default function ClientEligibilityPanel({ clientId, canManage }: Props) {
 const dataVersion = useDataVersion();
 const { addToast } = useToast();
 // Starts at 12 only until the first answer says which tenors this client's products offer;
 // then it moves to the longest one, unless the admin has already typed a tenor.
 const [tenor, setTenor] = useState('12');
 const [tenorEdited, setTenorEdited] = useState(false);
 const [type, setType] = useState<'AUTO' | 'LOAN' | 'TOPUP'>('AUTO');
 const [result, setResult] = useState<any>(null);
 const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
 const [capacityRecord, setCapacityRecord] = useState<any>(null);
 const [draft, setDraft] = useState<CapacityForm | null>(null);
 const [saving, setSaving] = useState(false);

 const tenorMonths = Math.max(1, Math.floor(Number(tenor) || 0));

 const assess = useCallback(async () => {
  if (!tenorMonths) return;
  const res: any = await loanEligibility_api.preview(clientId, { tenorMonths, ...(type === 'AUTO' ? {} : { type }) });
  if (res?.type === 'ERROR') {
   setState('error');
   return;
  }
  setResult(res.data);
  setState('ready');
 }, [clientId, tenorMonths, type]);

 useEffect(() => {
  const timer = setTimeout(assess, 250);
  return () => clearTimeout(timer);
 }, [assess, dataVersion]);

 useEffect(() => {
  if (!canManage) return;
  loanEligibility_api.getClientCapacity(clientId).then((res: any) => {
   if (res?.type !== 'ERROR') setCapacityRecord(res.data);
  });
 }, [clientId, canManage, dataVersion]);

 const saved = useMemo(() => capacityFormFrom(capacityRecord), [capacityRecord]);
 const capacity = draft ?? saved;
 const dirty = !sameCapacity(capacity, saved);

 const save = async () => {
  const { payload, error } = capacityPayload(capacity);
  if (!payload) {
   addToast(error || 'Complete the repayment capacity', 'error');
   return;
  }
  setSaving(true);
  const res: any = await loanEligibility_api.updateClientCapacity(clientId, payload);
  setSaving(false);
  if (res?.type === 'ERROR') return;
  setCapacityRecord(res.data);
  setDraft(null);
  addToast('Repayment capacity saved', 'success');
 };

 const range = result?.tenorRange;

 useEffect(() => {
  if (!tenorEdited && range?.max && String(range.max) !== tenor) setTenor(String(range.max));
 }, [range?.max, tenorEdited, tenor]);
 const isTopup = result?.type === 'TOPUP';

 return (
  <div className="flex flex-col lg:flex-row gap-4 items-start">
   <aside className="w-full lg:w-80 shrink-0 lg:sticky lg:top-4 bg-card border border-border rounded-2xl p-4 space-y-4">
    <div>
     <label htmlFor="eligibility-tenor" className="block text-sm font-semibold text-foreground mb-1.5">Tenor (months)</label>
     <input
      id="eligibility-tenor"
      type="number"
      min={range?.min ?? 1}
      max={range?.max ?? 360}
      inputMode="numeric"
      value={tenor}
      onChange={(e) => { setTenorEdited(true); setTenor(e.target.value); }}
      className="w-full h-11 px-3 bg-card border border-border rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400"
     />
     {range?.min != null && <span className="block mt-1 text-xs text-muted-foreground">Products for this sector offer {range.min}–{range.max} months.</span>}
    </div>
    <div role="radiogroup" aria-label="Request type" className="grid grid-cols-3 gap-1.5">
     {(['AUTO', 'LOAN', 'TOPUP'] as const).map((option) => (
      <button
       key={option}
       type="button"
       role="radio"
       aria-checked={type === option}
       onClick={() => setType(option)}
       className={`h-9 rounded-md border text-[12px] font-medium transition-colors ${type === option ? 'border-emerald-600 bg-emerald-700 text-white' : 'border-border bg-card text-foreground hover:bg-muted/50'}`}
      >
       {option === 'AUTO' ? 'Automatic' : option === 'LOAN' ? 'New loan' : 'Top-up'}
      </button>
     ))}
    </div>

    {state === 'loading' && <PulseLoader />}
    {state === 'error' && <p className="text-sm text-red-600">Could not work out eligibility.</p>}
    {state === 'ready' && result && (
     <div className={`rounded-lg border px-4 py-3 ${result.eligible ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20' : 'border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/20'}`}>
      <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
       {isTopup ? 'Most they can top up' : 'Most they can borrow'} · {result.tenorMonths} months
      </span>
      <span className="block text-2xl font-bold text-foreground mt-1">{naira(result.maxAmount)}</span>
      {result.eligible && result.monthlyRepayment != null && (
       <span className="block text-xs text-muted-foreground mt-1">
        {naira(result.monthlyRepayment)} a month{isTopup ? `, renewed loan ${naira(result.newLoanTotal)}` : ''}
       </span>
      )}
      {!result.eligible && result.reason && <span className="block text-sm text-rose-800 dark:text-rose-300 mt-1">{result.reason}</span>}
     </div>
    )}
   </aside>

   <section aria-label="Eligibility workings" className="flex-1 min-w-0 w-full bg-card border border-border rounded-2xl overflow-clip">
    <div className="p-5 border-b border-border">
     <h2 className="text-lg font-bold text-foreground">How the maximum is worked out</h2>
     <p className="text-sm text-muted-foreground">From the last three salary payments on the broadsheet, the repayment capacity and the product rate for this tenor.</p>
    </div>
    <div className="p-5">{result ? <AffordabilityWorkings affordability={result} /> : <PulseLoader />}</div>

    {canManage && (
     <>
      <div className="px-5 pt-5 pb-3 border-t border-border">
       <h3 className="text-sm font-bold text-foreground">
        This client&apos;s repayment capacity <span className="font-medium text-muted-foreground">{describeCapacity(capacityRecord) ?? 'not set'}</span>
       </h3>
       <p className="text-xs text-muted-foreground mt-0.5">Overrides their sector and the default, for this client only.</p>
      </div>
      <div className="px-5 pb-5">
       <RepaymentCapacityFields
        idPrefix="client"
        value={capacity}
        saved={saved}
        onChange={setDraft}
        notSetLabel="Use the sector or default"
        notSetDescription="The client gets their sector's setting, or the default if the sector has none."
       />
      </div>
      <div className="sticky bottom-0 px-5 py-3 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card">
       <span className="text-sm font-medium text-foreground/90">{dirty ? 'Capacity changed · applies to this client only' : 'No unsaved changes'}</span>
       <div className="flex gap-2">
        <button onClick={() => setDraft(null)} disabled={!dirty || saving} className="h-11 px-4 border border-border rounded-lg text-sm font-semibold text-foreground disabled:opacity-50">Discard</button>
        <button onClick={save} disabled={!dirty || saving} className="h-11 px-4 rounded-lg text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50">{saving ? 'Saving...' : 'Save changes'}</button>
       </div>
      </div>
     </>
    )}
   </section>
  </div>
 );
}
