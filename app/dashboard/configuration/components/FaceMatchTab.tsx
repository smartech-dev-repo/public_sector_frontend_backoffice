"use client";

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import ButtonLoader from '@/app/components/ui/ButtonLoader';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { useDataVersion } from '@/app/composables/useDataVersion';
import { useToast } from '@/app/composables/useToast';
import { FaceMatchSettings, faceMatchSettings_api } from '@/app/api_factory/modules/faceMatchSettings';

const INPUT = 'w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#018752]/20 focus:border-[#018752]';
const LABEL = 'block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2';
const HINT = 'text-[11px] text-muted-foreground mt-1 block';
const RECOMMENDED_MINIMUM = 40;

export default function FaceMatchTab() {
 const dataVersion = useDataVersion();
 const { addToast } = useToast();
 const [settings, setSettings] = useState<FaceMatchSettings | null>(null);
 const [form, setForm] = useState({ enabled: false, minimumScore: String(RECOMMENDED_MINIMUM) });
 const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
 const [saving, setSaving] = useState(false);

 const show = (next: FaceMatchSettings) => {
  setSettings(next);
  setForm({ enabled: next.enabled, minimumScore: String(next.minimumScore) });
 };

 const load = useCallback(async () => {
  const res: any = await faceMatchSettings_api.get();
  if (res?.type === 'ERROR') {
   setState('error');
   return;
  }
  show(res.data);
  setState('ready');
 }, []);

 useEffect(() => { load(); }, [load, dataVersion]);

 const handleSave = async (e: React.FormEvent) => {
  e.preventDefault();
  setSaving(true);
  const res: any = await faceMatchSettings_api.update({ enabled: form.enabled, minimumScore: Number(form.minimumScore) });
  setSaving(false);
  // The API layer has already shown the server's message for a rejected save.
  if (res?.type === 'ERROR') return;
  show(res.data);
  addToast('Face match settings saved', 'success');
 };

 if (state === 'loading') return <PulseLoader />;
 if (state === 'error' || !settings) {
  return <EmptyState title="Couldn't load face match settings" description="Refresh the page to try again." />;
 }

 const engineDown = !settings.engine.available;
 // Can't switch on while the engine is down; switching off is always allowed.
 const blocked = engineDown && form.enabled && !settings.enabled;
 const changed = form.enabled !== settings.enabled || Number(form.minimumScore) !== settings.minimumScore;

 return (
  <div className="max-w-2xl bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
   <div>
    <h2 className="text-lg font-bold text-foreground">Face Match</h2>
    <p className="text-xs text-muted-foreground mt-1">
     During onboarding, compare the client's photo with their BVN and NIN photos: the selfie when clients onboard themselves, or the passport photo when an agent or admin onboards them.
    </p>
   </div>

   {engineDown ? (
    <div role="status" className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-4 text-sm text-amber-900 dark:text-amber-200">
     <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden />
     <div className="min-w-0">
      <p className="font-semibold">The comparison engine isn't working on this server</p>
      <p className="mt-1 text-xs break-words">{settings.engine.detail}</p>
      <p className="mt-1 text-xs">Face match can't be switched on until this is fixed.{settings.enabled ? ' While it stays on, onboarding photos fail with "temporarily unavailable".' : ''}</p>
     </div>
    </div>
   ) : (
    <p role="status" className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
     <CheckCircle2 className="w-4 h-4" aria-hidden />
     Comparison engine ready ({settings.engine.detail})
    </p>
   )}

   <form onSubmit={handleSave} className="space-y-5">
    <div>
     <label className="flex items-start gap-3 cursor-pointer">
      <input
       type="checkbox"
       role="switch"
       checked={form.enabled}
       onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
       className="w-[18px] h-[18px] mt-0.5 accent-emerald-700"
      />
      <span>
       <span className="block text-sm font-semibold text-foreground">Compare photos during onboarding</span>
       <span className={HINT}>
        {form.enabled
         ? 'On: clients whose photo matches both ID photos are verified automatically. Others go to manual review. A photo with no face, or with more than one person, is refused so it can be retaken.'
         : "Off: the photo is kept but not compared, and onboarding completes on BVN and NIN verification alone."}
       </span>
      </span>
     </label>
    </div>

    <div>
     <label htmlFor="face-match-minimum" className={LABEL}>Minimum Match Score (%)</label>
     <input
      id="face-match-minimum"
      type="number"
      min="1"
      max="100"
      step="1"
      required
      value={form.minimumScore}
      onChange={(e) => setForm({ ...form, minimumScore: e.target.value })}
      className={`${INPUT} max-w-[160px]`}
     />
     <span className={HINT}>
      Each of the BVN and NIN photos must score at least this. Below it, the client goes to manual review; they aren't rejected. Recommended: {RECOMMENDED_MINIMUM}. The same person usually scores 50 or more, and different people under 25. Old ID photos can score lower, so raise this only after checking real results on client profiles.
     </span>
    </div>

    <button
     type="submit"
     disabled={saving || blocked || !changed}
     className="h-11 px-8 bg-[#018752] hover:bg-[#017044] text-white font-semibold text-sm rounded-xl transition-all disabled:opacity-50 min-w-[180px]"
    >
     <ButtonLoader loading={saving} loadingText="Saving...">Save Face Match Settings</ButtonLoader>
    </button>
   </form>
  </div>
 );
}
