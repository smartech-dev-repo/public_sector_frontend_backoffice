"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import PulseLoader from '@/app/components/ui/PulseLoader';
import { loans_api } from '@/app/api_factory/modules/loans';
import { sectors_api } from '@/app/api_factory/modules/sectors';
import { useConfirm } from '@/app/composables/useConfirm';
import { useToast } from '@/app/composables/useToast';
import { useDataVersion } from '@/app/composables/useDataVersion';
import RepaymentCapacityFields, { CapacityForm, capacityFormFrom, capacityPayload, describeCapacity, sameCapacity } from './RepaymentCapacityFields';
import SalaryPatternsEditor, { SalaryPatternRow } from './SalaryPatternsEditor';

const DEFAULT_ID = 'default';
type PanelTab = 'capacity' | 'salary';

/**
 * How much a client can borrow: the default repayment capacity and salary table, and a
 * capacity per sector. Laid out like Roles: pick on the left, edit on the right, save below.
 */
export default function LoanEligibilityTab() {
 const dataVersion = useDataVersion();
 const { confirm } = useConfirm();
 const { addToast } = useToast();
 const [settings, setSettings] = useState<any>(null);
 const [sectors, setSectors] = useState<any[]>([]);
 const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
 const [selectedId, setSelectedId] = useState<string>(DEFAULT_ID);
 const [activeTab, setActiveTab] = useState<PanelTab>('capacity');
 const [search, setSearch] = useState('');
 const [capacityDraft, setCapacityDraft] = useState<CapacityForm | null>(null);
 const [outcomesDraft, setOutcomesDraft] = useState<Record<string, string> | null>(null);
 const [saving, setSaving] = useState(false);

 const load = useCallback(async () => {
  const [settingsRes, sectorsRes]: any[] = await Promise.all([loans_api.getLoanSettings(), sectors_api.list()]);
  if (settingsRes?.type === 'ERROR' || sectorsRes?.type === 'ERROR') {
   setState('error');
   return;
  }
  setSettings(settingsRes.data);
  setSectors(sectorsRes.data || []);
  setState('ready');
 }, []);

 useEffect(() => { load(); }, [load, dataVersion]);

 const isDefault = selectedId === DEFAULT_ID;
 const selectedSector = sectors.find((sector) => sector.id === selectedId);
 const savedRecord = isDefault ? settings : selectedSector;
 const savedCapacity = useMemo(() => capacityFormFrom(savedRecord), [savedRecord]);
 const capacity = capacityDraft ?? savedCapacity;
 const rows: SalaryPatternRow[] = settings?.salaryPatterns ?? [];
 const savedOutcomes = useMemo(() => Object.fromEntries(rows.map((row) => [row.pattern, row.outcome])), [rows]);
 const outcomes = outcomesDraft ?? savedOutcomes;

 const capacityDirty = !sameCapacity(capacity, savedCapacity);
 const changedPatterns = rows.filter((row) => outcomes[row.pattern] !== row.outcome);
 const isDirty = capacityDirty || (isDefault && changedPatterns.length > 0);
 const defaultSummary = describeCapacity(settings);

 const confirmDiscard = async () =>
  !isDirty || (await confirm({ title: 'Discard changes?', message: 'You have unsaved changes here.', confirmText: 'Discard' }));

 const select = async (id: string) => {
  if (id === selectedId || !(await confirmDiscard())) return;
  setCapacityDraft(null);
  setOutcomesDraft(null);
  setSelectedId(id);
  setActiveTab('capacity');
 };

 const discard = () => {
  setCapacityDraft(null);
  setOutcomesDraft(null);
 };

 const save = async () => {
  const { payload, error } = capacityPayload(capacity);
  if (capacityDirty && !payload) {
   addToast(error || 'Complete the repayment capacity', 'error');
   setActiveTab('capacity');
   return;
  }
  setSaving(true);
  let res: any;
  if (isDefault) {
   res = await loans_api.updateLoanSettings({
    ...(capacityDirty ? payload : {}),
    ...(changedPatterns.length ? { salaryPatternOutcomes: Object.fromEntries(changedPatterns.map((row) => [row.pattern, outcomes[row.pattern]])) } : {}),
   });
  } else {
   res = await sectors_api.updateRepaymentCapacity(selectedId, payload!);
  }
  setSaving(false);
  // The API layer has already shown the server's message for a rejected save.
  if (res?.type === 'ERROR') return;
  addToast(isDefault ? 'Loan eligibility saved' : `${selectedSector?.code} saved`, 'success');
  discard();
  await load();
 };

 const visibleSectors = sectors.filter((sector) => `${sector.code} ${sector.name ?? ''}`.toLowerCase().includes(search.trim().toLowerCase()));
 const sectorsWithOwn = sectors.filter((sector) => describeCapacity(sector)).length;

 const tabs: { id: PanelTab; label: string }[] = [
  { id: 'capacity', label: 'Repayment capacity' },
  ...(isDefault ? [{ id: 'salary' as PanelTab, label: `Salary selection ${rows.length} patterns` }] : []),
 ];

 const footerSummary = () => {
  if (!isDirty) return 'No unsaved changes';
  const parts = [
   ...(capacityDirty ? ['capacity changed'] : []),
   ...(isDefault && changedPatterns.length ? [`${changedPatterns.length} salary ${changedPatterns.length === 1 ? 'pattern' : 'patterns'} changed`] : []),
  ];
  const reach = isDefault ? `applies to every client without their own or a sector setting` : `applies to ${selectedSector?.code} clients without their own setting`;
  return `${parts.join(', ')} · ${reach}`;
 };

 if (state === 'loading') return <PulseLoader />;
 if (state === 'error') {
  return (
   <div className="text-center py-12">
    <p className="text-red-600 mb-3">Could not load loan eligibility settings.</p>
    <button onClick={load} className="h-11 px-4 border border-border rounded-lg text-sm font-medium">Try again</button>
   </div>
  );
 }

 return (
  <main className="w-full space-y-4">
   <p className="text-sm text-muted-foreground">
    The most a client can borrow is <span className="font-mono text-foreground">Usable pay × Tenor ÷ (1 + Rate × Tenor ÷ 100)</span>. A top-up is the same, less what they still owe.
    Pick the default or a sector, set its repayment capacity, then save. A client&apos;s own setting, on their profile, comes first.
   </p>

   <div className="flex flex-col lg:flex-row gap-4 items-start">
    <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-4 bg-card border border-border rounded-2xl p-2.5 space-y-1.5">
     <button
      onClick={() => select(DEFAULT_ID)}
      aria-current={isDefault}
      className={`w-full min-h-[60px] px-3 py-2 text-left rounded-lg border transition-colors ${isDefault ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20' : 'border-transparent hover:bg-muted/50'}`}
     >
      <span className="block text-sm font-semibold text-foreground">Default</span>
      <span className="block text-xs text-muted-foreground">Every client, unless overridden</span>
      <span className={`block text-xs ${defaultSummary ? 'text-muted-foreground' : 'text-rose-700 dark:text-rose-400 font-semibold'}`}>{defaultSummary ?? 'Not set: clients can’t be assessed'}</span>
     </button>
     <div className="px-1 pt-2 pb-1 flex items-center justify-between">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sectors</span>
      <span className="text-xs text-muted-foreground">{sectorsWithOwn} of {sectors.length} own setting</span>
     </div>
     <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      aria-label="Search sectors"
      placeholder="Search sectors"
      className="w-full h-11 px-3 bg-card border border-border rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400"
     />
     <div className="max-h-60 lg:max-h-[60vh] overflow-y-auto space-y-1">
      {visibleSectors.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">{sectors.length ? 'No sectors match.' : 'No sectors yet.'}</p>}
      {visibleSectors.map((sector) => (
       <button
        key={sector.id}
        onClick={() => select(sector.id)}
        aria-current={sector.id === selectedId}
        className={`w-full min-h-[60px] px-3 py-2 text-left rounded-lg border transition-colors ${sector.id === selectedId ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20' : 'border-transparent hover:bg-muted/50'}`}
       >
        <span className="block text-sm font-semibold text-foreground truncate">{sector.code}</span>
        <span className="block text-xs text-muted-foreground truncate">{sector.name || 'No full name'}</span>
        <span className="block text-xs text-muted-foreground">{describeCapacity(sector) ?? 'Uses the default'}</span>
       </button>
      ))}
     </div>
    </aside>

    <section aria-label={isDefault ? 'Default' : selectedSector?.code} className="flex-1 min-w-0 w-full bg-card border border-border rounded-2xl overflow-clip">
     <div className="p-5 border-b border-border space-y-3">
      <div className="min-w-0">
       <h2 className="text-lg font-bold text-foreground break-words">{isDefault ? 'Default' : selectedSector?.code}</h2>
       <p className="text-sm text-muted-foreground">
        {isDefault
         ? 'Used for every client whose sector and profile have no setting of their own.'
         : `${selectedSector?.name || 'This sector'}. Used for its clients unless their profile has its own setting.`}
       </p>
       <p className="text-sm text-foreground/90 mt-1">
        <span className="text-muted-foreground">Now:</span> {describeCapacity(savedRecord) ?? (isDefault ? 'Not set' : `Uses the default${defaultSummary ? ` (${defaultSummary})` : ''}`)}
       </p>
      </div>
      <div role="tablist" className="flex gap-5 overflow-x-auto">
       {tabs.map((tab) => (
        <button
         key={tab.id}
         role="tab"
         aria-selected={activeTab === tab.id}
         onClick={() => setActiveTab(tab.id)}
         className={`pb-1.5 min-h-9 text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'border-emerald-700 text-emerald-700 dark:text-emerald-400 font-bold' : 'border-transparent text-muted-foreground font-medium hover:text-foreground'}`}
        >
         {tab.label}
        </button>
       ))}
      </div>
     </div>

     <div className="p-5">
      {activeTab === 'capacity' && (
       <RepaymentCapacityFields
        idPrefix={isDefault ? 'default' : `sector-${selectedId}`}
        value={capacity}
        saved={savedCapacity}
        onChange={setCapacityDraft}
        notSetLabel={isDefault ? 'Not set' : 'Use the default'}
        notSetDescription={isDefault ? 'No client can be assessed until a default or their sector has a setting.' : defaultSummary ? `Clients get the default: ${defaultSummary}.` : 'The default is not set either.'}
       />
      )}
      {activeTab === 'salary' && isDefault && <SalaryPatternsEditor rows={rows} value={outcomes} onChange={setOutcomesDraft} />}
     </div>

     <div className="sticky bottom-0 px-5 py-3 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card">
      <span className="text-sm font-medium text-foreground/90">{footerSummary()}</span>
      <div className="flex gap-2">
       <button onClick={discard} disabled={!isDirty || saving} className="h-11 px-4 border border-border rounded-lg text-sm font-semibold text-foreground disabled:opacity-50">Discard</button>
       <button onClick={save} disabled={!isDirty || saving} className="h-11 px-4 rounded-lg text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50">
        {saving ? 'Saving...' : 'Save changes'}
       </button>
      </div>
     </div>
    </section>
   </div>
  </main>
 );
}
