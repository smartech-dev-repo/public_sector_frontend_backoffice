"use client";

import { useEffect, useState } from 'react';
import ButtonLoader from '@/app/components/ui/ButtonLoader';
import { useLoans } from '@/app/composables/modules/useLoans';
import { useToast } from '@/app/composables/useToast';

const INPUT = 'w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#018752]/20 focus:border-[#018752]';
/** +2348031234567 → 08031234567 for display. */
const localPhone = (phone?: string | null) => (phone ? (phone.startsWith('+234') ? `0${phone.slice(4)}` : phone) : '');

const LABEL = 'block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2';

export default function LoanSettingsTab() {
 const { fetchLoanSettings, updateLoanSettings } = useLoans();
 const { addToast } = useToast();
 const [form, setForm] = useState({ retirementAgeYears: 60, maxServiceYears: 35, loanApprovalPhone: '' });
 const [saving, setSaving] = useState(false);

 useEffect(() => {
  fetchLoanSettings().then((settings: any) => {
   if (settings) {
    setForm({
     retirementAgeYears: settings.retirementAgeYears || 60,
     maxServiceYears: settings.maxServiceYears || 35,
     loanApprovalPhone: localPhone(settings.loanApprovalPhone),
    });
   }
  });
 }, [fetchLoanSettings]);

 const handleSave = async (e: React.FormEvent) => {
  e.preventDefault();
  setSaving(true);
  try {
   await updateLoanSettings({
    retirementAgeYears: Number(form.retirementAgeYears),
    maxServiceYears: Number(form.maxServiceYears),
    ...(form.loanApprovalPhone.trim() ? { loanApprovalPhone: form.loanApprovalPhone.trim() } : {}),
   });
   addToast('Loan settings saved', 'success');
  } catch (err: any) {
   addToast(err?.message || 'Failed to save loan settings', 'error');
  } finally {
   setSaving(false);
  }
 };

 return (
  <div className="max-w-2xl bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
   <div>
    <h2 className="text-lg font-bold text-foreground">Loan Settings</h2>
    <p className="text-xs text-muted-foreground mt-1">The eligibility limits applied to every public sector loan product, and where agent-made loan codes are sent.</p>
   </div>
   <form onSubmit={handleSave} className="space-y-5">
    <div>
     <label htmlFor="retirement-age" className={LABEL}>Mandatory Retirement Age (Years)</label>
     <input id="retirement-age" type="number" min="45" max="75" required value={form.retirementAgeYears} onChange={(e) => setForm({ ...form, retirementAgeYears: Number(e.target.value) })} className={INPUT} />
     <span className="text-[11px] text-muted-foreground mt-1 block">Loans will not be approved if the repayment tenor runs past the applicant's retirement age.</span>
    </div>
    <div>
     <label htmlFor="max-service" className={LABEL}>Maximum Service Years Allowed</label>
     <input id="max-service" type="number" min="10" max="45" required value={form.maxServiceYears} onChange={(e) => setForm({ ...form, maxServiceYears: Number(e.target.value) })} className={INPUT} />
     <span className="text-[11px] text-muted-foreground mt-1 block">The longest time in public service before compulsory pension transition.</span>
    </div>
    <div>
     <label htmlFor="loan-approval-phone" className={LABEL}>Loan Approval Phone Number</label>
     <input id="loan-approval-phone" type="tel" inputMode="tel" placeholder="08031234567" value={form.loanApprovalPhone} onChange={(e) => setForm({ ...form, loanApprovalPhone: e.target.value })} className={INPUT} />
     <span className="text-[11px] text-muted-foreground mt-1 block">When an agent requests a loan or top-up, the client is texted a code and told to send it to this number. An admin then enters the code on the loan request. Agents can't request loans until this is set.</span>
    </div>
    <button type="submit" disabled={saving} className="h-11 px-8 bg-[#018752] hover:bg-[#017044] text-white font-semibold text-sm rounded-xl transition-all disabled:opacity-50 min-w-[180px]">
     <ButtonLoader loading={saving} loadingText="Saving...">Save Loan Settings</ButtonLoader>
    </button>
   </form>
  </div>
 );
}
