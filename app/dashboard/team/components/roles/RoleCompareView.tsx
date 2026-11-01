"use client";

import { Fragment, useMemo, useState } from 'react';
import { Check, Minus } from 'lucide-react';
import type { PermissionGroup } from './permissionGroups';

export default function RoleCompareView({ roles, groups }: { roles: any[]; groups: PermissionGroup[] }) {
 const [query, setQuery] = useState('');
 const [differencesOnly, setDifferencesOnly] = useState(false);

 const holders = useMemo(
  () => roles.map((role) => new Set<string>((role.permissions || []).map((p: any) => p.permission?.id))),
  [roles],
 );

 const visibleGroups = useMemo(() => {
  const term = query.trim().toLowerCase();
  return groups
   .map((group) => ({
    ...group,
    items: group.items.filter((item) => {
     if (term && !`${item.label} ${item.key}`.toLowerCase().includes(term)) return false;
     if (!differencesOnly) return true;
     const held = holders.filter((set) => set.has(item.id)).length;
     return held > 0 && held < roles.length;
    }),
   }))
   .filter((group) => group.items.length > 0);
 }, [groups, query, differencesOnly, holders, roles.length]);

 return (
  <div className="space-y-3">
   <div className="flex flex-wrap items-center gap-3">
    <input
     value={query}
     onChange={(e) => setQuery(e.target.value)}
     aria-label="Search permissions"
     placeholder="Search permissions"
     className="w-full sm:w-72 h-11 px-3 bg-card border border-border rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400"
    />
    <label className="flex items-center gap-2 min-h-11 text-sm text-foreground cursor-pointer">
     <input type="checkbox" checked={differencesOnly} onChange={(e) => setDifferencesOnly(e.target.checked)} className="w-[18px] h-[18px] accent-emerald-700" />
     Show differences only
    </label>
   </div>
   <div className="bg-card rounded-2xl border border-border overflow-auto max-h-[70vh]">
    <table className="w-full text-sm border-separate border-spacing-0">
     <thead>
      <tr>
       <th scope="col" className="sticky top-0 left-0 z-20 bg-[#E9F4EE] dark:bg-emerald-950 px-4 py-3 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 min-w-[240px]">Permission</th>
       {roles.map((role) => (
        <th key={role.id} scope="col" className="sticky top-0 z-10 bg-[#E9F4EE] dark:bg-emerald-950 px-3 py-3 text-center text-xs font-medium text-emerald-700 dark:text-emerald-400 min-w-[120px]">
         <span className="block">{role.name}</span>
         <span className="block font-normal text-muted-foreground">{role.department?.name || 'No department'}</span>
         <span className="block font-normal text-muted-foreground">{holders[roles.indexOf(role)].size} of {groups.reduce((sum, group) => sum + group.items.length, 0)}</span>
        </th>
       ))}
      </tr>
     </thead>
     <tbody>
      {visibleGroups.length === 0 && (
       <tr><td colSpan={roles.length + 1} className="p-8 text-center text-muted-foreground">No permissions to show.</td></tr>
      )}
      {visibleGroups.map((group) => (
       <Fragment key={group.name}>
        <tr>
         <th colSpan={roles.length + 1} scope="colgroup" className="bg-muted/50 px-4 py-2 text-left text-xs font-bold text-foreground/80">{group.name}</th>
        </tr>
        {group.items.map((item) => (
         <tr key={item.id}>
          <th scope="row" className="sticky left-0 bg-card px-4 py-2 text-left font-medium border-t border-border/50">
           <span className="block text-[13px] text-foreground">{item.label}</span>
           <span className="block text-[11px] font-normal font-mono text-muted-foreground">{item.key}</span>
          </th>
          {roles.map((role, index) => {
           const held = holders[index].has(item.id);
           return (
            <td key={role.id} className="px-3 py-2 text-center border-t border-border/50">
             {held
              ? <Check className="inline w-4 h-4 text-emerald-700 dark:text-emerald-400" aria-label="Yes" />
              : <Minus className="inline w-4 h-4 text-muted-foreground/50" aria-label="No" />}
            </td>
           );
          })}
         </tr>
        ))}
       </Fragment>
      ))}
     </tbody>
    </table>
   </div>
  </div>
 );
}
