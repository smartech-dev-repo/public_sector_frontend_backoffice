"use client";

import { naira } from '@/app/dashboard/configuration/components/RepaymentCapacityFields';
import { outcomeLabel, PatternBars } from '@/app/dashboard/configuration/components/SalaryPatternsEditor';

const SOURCE: Record<string, string> = { CLIENT: "client's own setting", SECTOR: "sector's setting", DEFAULT: 'default setting' };

function Step({ n, title, value, children, muted }: { n: number; title: string; value?: React.ReactNode; children?: React.ReactNode; muted?: boolean }) {
 return (
  <li className={`flex gap-3 px-3 py-2.5 rounded-lg border ${muted ? 'border-border bg-muted/30' : 'border-border bg-card'}`}>
   <span className="w-6 h-6 shrink-0 rounded-full bg-emerald-700 text-white text-xs font-bold inline-flex items-center justify-center">{n}</span>
   <div className="flex-1 min-w-0">
    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
     <span className="text-[13px] font-semibold text-foreground">{title}</span>
     {value !== undefined && <span className="text-sm font-bold text-foreground">{value}</span>}
    </div>
    {children && <div className="text-[12px] text-muted-foreground mt-0.5">{children}</div>}
   </div>
  </li>
 );
}

/**
 * The steps from salary to maximum, from a saved assessment (on a loan request) or a live
 * preview. Every number shown is the one the server used.
 */
export default function AffordabilityWorkings({ affordability: a }: { affordability: any }) {
 if (!a) return <p className="text-sm text-muted-foreground">No workings were saved for this request.</p>;
 const s = a.salary ?? {};
 const months = [
  ['3 months ago', s.paymentThreeMonthsAgo],
  ['2 months ago', s.paymentTwoMonthsAgo],
  ['Last month', s.paymentLastMonth],
 ] as const;
 const isTopup = a.type === 'TOPUP';
 const cap = a.capacity;
 const p = a.product;
 const salaryIn = (s.salaryUsed ?? 0) + (a.repaymentAddedBack ?? 0);
 let n = 0;

 return (
  <ol className="space-y-2">
   <Step n={++n} title="Salary" value={s.salaryUsed != null ? naira(s.salaryUsed) : 'Incomplete'}>
    <div className="flex flex-wrap items-center gap-4 mt-1">
     {s.pattern && <PatternBars pattern={s.pattern} />}
     <span className="grid grid-cols-[auto_auto] gap-x-3">
      {months.map(([label, amount], i) => (
       <span key={label} className="contents">
        <span>{label}{s.pattern ? ` (${s.pattern[i]})` : ''}</span>
        <span className="text-foreground font-medium text-right">{naira(amount)}</span>
       </span>
      ))}
     </span>
    </div>
    {s.pattern && <span className="block mt-1">Pattern {s.pattern.split('').join(' ')} uses {outcomeLabel(s.outcome, s.pattern)}.</span>}
   </Step>

   {isTopup && a.repaymentAddedBack > 0 && (
    <Step n={++n} title="Current repayment added back" value={`+ ${naira(a.repaymentAddedBack)}`}>
     The broadsheet pay is after this deduction, and the renewed loan replaces it: {naira(s.salaryUsed)} + {naira(a.repaymentAddedBack)} = {naira(salaryIn)}.
    </Step>
   )}

   {cap ? (
    <Step n={++n} title="Usable pay" value={naira(cap.usablePay)}>
     {cap.method === 'BASE_PAY'
      ? `Base pay ${naira(cap.basePayAmount)}: ${naira(salaryIn)} − ${naira(cap.basePayAmount)}`
      : `DTI ${Number(cap.dtiPercent)}%: ${naira(salaryIn)} × ${Number(cap.dtiPercent)}%`}
     {' '}· from the {SOURCE[cap.source] ?? cap.source}
    </Step>
   ) : (
    <Step n={++n} title="Usable pay" value="—" muted>No repayment capacity applies yet.</Step>
   )}

   {p ? (
    <Step n={++n} title="Payback ratio" value={a.paybackRatio != null ? Number(a.paybackRatio).toFixed(4).replace(/0+$/, '').replace(/\.$/, '') : '—'}>
     1 + {p.monthlyRatePercent}% × {a.tenorMonths} months ÷ 100 · {p.name} ({p.code}), {p.monthlyRatePercent}% a month flat
     {p.managementChargeApplication === 'ADD_TO_REPAYMENT' &&
      ` · the ${p.managementChargeType === 'PERCENTAGE' ? `${p.managementChargeValue}%` : naira(p.managementChargeValue)} charge is repaid with the loan, so it lowers the maximum`}
    </Step>
   ) : (
    <Step n={++n} title="Payback ratio" value="—" muted>No product offers this tenor.</Step>
   )}

   {isTopup && a.currentLoan && (
    <Step n={++n} title="Still owed on the current loan" value={`− ${naira(a.currentLoan.outstandingBalance)}`}>
     It carries into the renewed loan, so it comes off what can be topped up.
    </Step>
   )}

   <Step n={++n} title={isTopup ? 'Most they can top up' : 'Most they can borrow'} value={naira(a.maxAmount)}>
    {cap && p
     ? `${naira(cap.usablePay)} × ${a.tenorMonths} ÷ ${a.paybackRatio != null ? Number(a.paybackRatio).toFixed(2) : '—'}${isTopup && a.currentLoan ? ` − ${naira(a.currentLoan.outstandingBalance)}` : ''}, rounded down to ₦1,000, within the product's ${naira(p.minimumAmount)}–${naira(p.maximumAmount)}`
     : a.reason}
    {a.eligible === false && a.reason && cap && p && <span className="block text-rose-700 dark:text-rose-400 font-medium">{a.reason}</span>}
   </Step>
  </ol>
 );
}
