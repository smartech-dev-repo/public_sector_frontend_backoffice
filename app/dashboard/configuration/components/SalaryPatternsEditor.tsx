"use client";

export interface SalaryPatternRow {
 pattern: string;
 aliases: string[];
 outcome: string;
 defaultOutcome: string;
 allowedOutcomes: string[];
}

export function outcomeLabel(outcome: string, pattern = 'ABC'): string {
 const twoLevels = !pattern.includes('C');
 switch (outcome) {
  case 'A': return 'A · lowest';
  case 'B': return twoLevels ? 'B · higher' : 'B · middle';
  case 'C': return 'C · highest';
  case 'AVG_AB': return 'Avg A & B';
  case 'AVG_AC': return 'Avg A & C';
  case 'AVG_BC': return 'Avg B & C';
  case 'AVG_ABC': return 'Avg of all';
  default: return outcome;
 }
}

/** Three bars, oldest month first, sized by each month's level. */
export function PatternBars({ pattern }: { pattern: string }) {
 const levels = pattern.split('').map((l) => l.charCodeAt(0) - 64);
 const top = Math.max(...levels);
 return (
  <span className="inline-flex items-end gap-1.5" aria-label={`Pattern ${pattern.split('').join(' ')}`}>
   {levels.map((level, i) => (
    <span key={i} className="flex flex-col items-center gap-1">
     <span className="w-4 rounded-sm bg-emerald-600/80 dark:bg-emerald-400/80" style={{ height: top === 1 ? 22 : 8 + Math.round(((level - 1) / (top - 1)) * 14) }} />
     <span className="text-[11px] font-bold text-foreground leading-none">{pattern[i]}</span>
    </span>
   ))}
  </span>
 );
}

const GROUPS = [
 { name: 'All three months equal', test: (p: string) => p === 'AAA' },
 { name: 'Two levels', test: (p: string) => p !== 'AAA' && !p.includes('C') },
 { name: 'Three different amounts', test: (p: string) => p.includes('C') },
];

interface Props {
 rows: SalaryPatternRow[];
 value: Record<string, string>;
 onChange: (value: Record<string, string>) => void;
 readOnly?: boolean;
}

/**
 * Which of the last three payments counts as salary, per pattern. Laid out like the role
 * permission editor: grouped cards, green when set, amber while changed and unsaved.
 */
export default function SalaryPatternsEditor({ rows, value, onChange, readOnly }: Props) {
 return (
  <div className="space-y-5">
   <p className="px-3 py-2.5 rounded-lg bg-muted/50 text-sm text-foreground/90">
    Each month gets a letter by how its pay ranks against the other two: <b>A</b> is the lowest, then <b>B</b>, then <b>C</b>. Bars run from
    3 months ago to last month. Months less than ₦1 apart count as equal, and a missing or zero month means the client can&apos;t be assessed.
    This table applies to every sector.
   </p>
   {GROUPS.map((group) => {
    const groupRows = rows.filter((row) => group.test(row.pattern));
    const changedCount = groupRows.filter((row) => value[row.pattern] !== row.outcome).length;
    return (
     <section key={group.name} aria-label={group.name}>
      <div className="flex items-center justify-between gap-3 min-h-9 mb-1">
       <h3 className="text-sm font-bold text-foreground">
        {group.name} <span className="font-medium text-muted-foreground">{groupRows.length} {groupRows.length === 1 ? 'pattern' : 'patterns'}{changedCount ? ` · ${changedCount} changed` : ''}</span>
       </h3>
      </div>
      <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
       {groupRows.map((row) => {
        const current = value[row.pattern] ?? row.outcome;
        const changed = current !== row.outcome;
        const tone = changed ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/20' : 'border-border bg-card';
        return (
         <div key={row.pattern} className={`px-3 py-2.5 rounded-lg border ${tone}`}>
          <div className="flex items-start gap-3">
           <PatternBars pattern={row.pattern} />
           <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
             <span className="text-[13px] font-semibold text-foreground font-mono">{row.pattern.split('').join(' ')}</span>
             {changed && <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400">Changed</span>}
            </div>
            <span className="block text-[11px] text-muted-foreground font-mono truncate">
             {row.aliases.length ? `also ${row.aliases.map((a) => a.split('').join(' ')).join(', ')}` : 'one way to write it'}
            </span>
           </div>
          </div>
          <div role="radiogroup" aria-label={`Salary to use for ${row.pattern.split('').join(' ')}`} className="flex flex-wrap gap-1.5 mt-2.5">
           {row.allowedOutcomes.map((outcome) => {
            const on = current === outcome;
            return (
             <button
              key={outcome}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={readOnly || row.allowedOutcomes.length === 1}
              onClick={() => onChange({ ...value, [row.pattern]: outcome })}
              className={`h-8 px-2.5 rounded-md border text-[12px] font-medium transition-colors ${on ? 'border-emerald-600 bg-emerald-700 text-white' : 'border-border bg-card text-foreground hover:bg-muted/50'} disabled:cursor-default`}
             >
              {outcomeLabel(outcome, row.pattern)}
             </button>
            );
           })}
          </div>
          {current !== row.defaultOutcome && (
           <span className="block mt-2 text-[11px] text-muted-foreground">Model value: {outcomeLabel(row.defaultOutcome, row.pattern)}</span>
          )}
         </div>
        );
       })}
      </div>
     </section>
    );
   })}
  </div>
 );
}
