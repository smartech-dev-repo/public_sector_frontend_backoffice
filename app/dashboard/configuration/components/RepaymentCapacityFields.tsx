"use client";

import type { CapacityMethod, RepaymentCapacityPayload } from '@/app/api_factory/modules/loanEligibility';

/** Form state: amounts are kept as typed text so a field can be empty. */
export interface CapacityForm {
 method: CapacityMethod | 'NONE';
 basePayAmount: string;
 dtiPercent: string;
}

const INPUT = 'w-full h-11 px-3 bg-card border border-border rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400';

export const naira = (value: number | string | null | undefined) => {
 if (value === null || value === undefined || value === '') return '—';
 const amount = Number(value);
 const digits = Number.isInteger(amount) ? 0 : 2;
 return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: digits, maximumFractionDigits: 2 })}`;
};

export function capacityFormFrom(record: any): CapacityForm {
 return {
  method: record?.affordabilityMethod ?? 'NONE',
  basePayAmount: record?.basePayAmount != null ? String(Number(record.basePayAmount)) : '',
  dtiPercent: record?.dtiPercent != null ? String(Number(record.dtiPercent)) : '',
 };
}

const usesBasePay = (method: CapacityForm['method']) => method === 'BASE_PAY' || method === 'BASE_PAY_DTI';
const usesDti = (method: CapacityForm['method']) => method === 'DTI' || method === 'BASE_PAY_DTI';

export const sameCapacity = (a: CapacityForm, b: CapacityForm) =>
 a.method === b.method &&
 (!usesBasePay(a.method) || Number(a.basePayAmount) === Number(b.basePayAmount)) &&
 (!usesDti(a.method) || Number(a.dtiPercent) === Number(b.dtiPercent));

/** Null when the form is incomplete; the message says what is missing. */
export function capacityPayload(form: CapacityForm): { payload: RepaymentCapacityPayload | null; error?: string } {
 if (form.method === 'NONE') return { payload: { affordabilityMethod: null } };
 const payload: RepaymentCapacityPayload = { affordabilityMethod: form.method };
 if (usesBasePay(form.method)) {
  if (form.basePayAmount.trim() === '' || Number(form.basePayAmount) < 0) return { payload: null, error: 'Enter the base pay amount' };
  payload.basePayAmount = Number(form.basePayAmount);
 }
 if (usesDti(form.method)) {
  const dti = Number(form.dtiPercent);
  if (form.dtiPercent.trim() === '' || dti <= 0 || dti > 100) return { payload: null, error: 'Enter a DTI between 0.01% and 100%' };
  payload.dtiPercent = dti;
 }
 return { payload };
}

/** One line, e.g. "Base pay ₦50,000", "DTI 33.33%" or "DTI 40%, keeping ₦50,000". Null when not set. */
export function describeCapacity(record: any): string | null {
 if (record?.affordabilityMethod === 'BASE_PAY_DTI') return `DTI ${Number(record.dtiPercent)}%, keeping ${naira(record.basePayAmount)}`;
 if (record?.affordabilityMethod === 'BASE_PAY') return `Base pay ${naira(record.basePayAmount)}`;
 if (record?.affordabilityMethod === 'DTI') return `DTI ${Number(record.dtiPercent)}%`;
 return null;
}

interface Props {
 value: CapacityForm;
 saved: CapacityForm;
 onChange: (value: CapacityForm) => void;
 /** Shown on the "not set" card, e.g. "Use the default: DTI 40%". */
 notSetLabel: string;
 notSetDescription: string;
 readOnly?: boolean;
 idPrefix: string;
}

const OPTIONS: { id: CapacityForm['method']; label: string; description: string; formula: string }[] = [
 { id: 'BASE_PAY', label: 'Base pay', description: 'The client keeps a fixed amount each month; the rest can go to repayment.', formula: 'Usable pay = Salary − Base pay' },
 { id: 'DTI', label: 'DTI', description: 'A share of the salary can go to repayment.', formula: 'Usable pay = Salary × DTI %' },
 { id: 'BASE_PAY_DTI', label: 'Base pay + DTI', description: 'The DTI share, cut back when needed so the client still keeps base pay.', formula: 'Usable pay = lower of (Salary × DTI %) and (Salary − Base pay)' },
];

/**
 * Pick-one cards in the style of the role permission editor: the chosen card is green,
 * and turns amber while it differs from what is saved.
 */
export default function RepaymentCapacityFields({ value, saved, onChange, notSetLabel, notSetDescription, readOnly, idPrefix }: Props) {
 const cards = [{ id: 'NONE' as const, label: notSetLabel, description: notSetDescription, formula: '' }, ...OPTIONS];
 const valueChanged = (field: 'basePayAmount' | 'dtiPercent') => value.method === saved.method && Number(value[field]) !== Number(saved[field]);

 return (
  <div className="space-y-4">
   <div role="radiogroup" aria-label="Repayment capacity method" className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
    {cards.map((card) => {
     const checked = value.method === card.id;
     const changed = checked && value.method !== saved.method;
     const tone = changed
      ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/20'
      : checked
       ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20'
       : 'border-border bg-card';
     return (
      <label key={card.id} className={`flex items-start gap-3 min-h-[76px] px-3 py-2.5 rounded-lg border ${tone} ${readOnly ? '' : 'cursor-pointer'}`}>
       <input
        type="radio"
        name={`${idPrefix}-method`}
        checked={checked}
        disabled={readOnly}
        onChange={() => onChange({ ...value, method: card.id })}
        className="mt-0.5 w-[18px] h-[18px] shrink-0 accent-emerald-700"
       />
       <span className="flex-1 min-w-0">
        <span className="flex items-center justify-between gap-2">
         <span className="text-[13px] font-semibold text-foreground">{card.label}</span>
         {changed && <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400">Changed</span>}
        </span>
        <span className="block text-[12px] text-muted-foreground mt-0.5">{card.description}</span>
        {card.formula && <span className="block text-[11px] font-mono text-muted-foreground mt-1">{card.formula}</span>}
       </span>
      </label>
     );
    })}
   </div>

   {value.method === 'BASE_PAY_DTI' && (
    <p className="px-3 py-2.5 rounded-lg bg-muted/50 text-sm text-foreground/90 max-w-2xl">
     The DTI share goes to repayment, but never so much that the client keeps less than base pay. With DTI 40% and base pay ₦50,000: a
     ₦150,000 salary gives ₦60,000 (DTI); an ₦80,000 salary gives ₦30,000, so the client keeps ₦50,000.
    </p>
   )}
   <div className="flex flex-wrap gap-4">
   {usesBasePay(value.method) && (
    <div className="w-full max-w-sm">
     <label htmlFor={`${idPrefix}-base-pay`} className="block text-sm font-semibold text-foreground mb-1.5">
      Base pay (₦ a month) {valueChanged('basePayAmount') && <span className="ml-1 text-[11px] font-bold text-amber-800 dark:text-amber-400">Changed</span>}
     </label>
     <input id={`${idPrefix}-base-pay`} type="number" min="0" step="0.01" inputMode="decimal" disabled={readOnly} value={value.basePayAmount} onChange={(e) => onChange({ ...value, basePayAmount: e.target.value })} className={INPUT} placeholder="50000" />
    </div>
   )}
   {usesDti(value.method) && (
    <div className="w-full max-w-sm">
     <label htmlFor={`${idPrefix}-dti`} className="block text-sm font-semibold text-foreground mb-1.5">
      DTI (% of salary) {valueChanged('dtiPercent') && <span className="ml-1 text-[11px] font-bold text-amber-800 dark:text-amber-400">Changed</span>}
     </label>
     <input id={`${idPrefix}-dti`} type="number" min="0.01" max="100" step="0.01" inputMode="decimal" disabled={readOnly} value={value.dtiPercent} onChange={(e) => onChange({ ...value, dtiPercent: e.target.value })} className={INPUT} placeholder="33.33" />
    </div>
   )}
   </div>
  </div>
 );
}
