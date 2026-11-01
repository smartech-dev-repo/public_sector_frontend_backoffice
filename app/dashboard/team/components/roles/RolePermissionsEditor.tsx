"use client";

import { useMemo, useState } from 'react';
import type { PermissionGroup } from './permissionGroups';

interface RolePermissionsEditorProps {
 groups: PermissionGroup[];
 savedIds: string[];
 selectedIds: string[];
 readOnly: boolean;
 onChange: (ids: string[]) => void;
}

export default function RolePermissionsEditor({ groups, savedIds, selectedIds, readOnly, onChange }: RolePermissionsEditorProps) {
 const [query, setQuery] = useState('');

 const visibleGroups = useMemo(() => {
  const term = query.trim().toLowerCase();
  if (!term) return groups;
  return groups
   .map((group) => ({
    ...group,
    items: group.items.filter((item) => `${item.label} ${item.key} ${item.description}`.toLowerCase().includes(term)),
   }))
   .filter((group) => group.items.length > 0);
 }, [groups, query]);

 const toggle = (id: string) => {
  onChange(selectedIds.includes(id) ? selectedIds.filter((value) => value !== id) : [...selectedIds, id]);
 };

 const toggleGroup = (ids: string[], allSelected: boolean) => {
  onChange(allSelected ? selectedIds.filter((id) => !ids.includes(id)) : [...new Set([...selectedIds, ...ids])]);
 };

 return (
  <div className="space-y-4">
   <input
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    aria-label="Search permissions"
    placeholder="Search permissions"
    className="w-full h-11 px-3 bg-card border border-border rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400"
   />
   {visibleGroups.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No permissions match your search.</p>}
   {visibleGroups.map((group) => {
    const ids = group.items.map((item) => item.id);
    const selectedCount = ids.filter((id) => selectedIds.includes(id)).length;
    const allSelected = selectedCount === ids.length;
    return (
     <section key={group.name} aria-label={group.name}>
      <div className="flex items-center justify-between gap-3 min-h-9 mb-1">
       <h3 className="text-sm font-bold text-foreground">
        {group.name} <span className="font-medium text-muted-foreground">{selectedCount} of {ids.length}</span>
       </h3>
       {!readOnly && (
        <button type="button" onClick={() => toggleGroup(ids, allSelected)} className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
         {allSelected ? 'Clear group' : 'Select all'}
        </button>
       )}
      </div>
      <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
       {group.items.map((item) => {
        const checked = selectedIds.includes(item.id);
        const changed = checked !== savedIds.includes(item.id);
        const tone = changed
         ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/20'
         : checked
          ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20'
          : 'border-border bg-card';
        return (
         <label key={item.id} title={item.description} className={`flex items-center gap-3 min-h-[52px] px-3 py-1.5 rounded-lg border ${tone} ${readOnly ? '' : 'cursor-pointer'}`}>
          <input
           type="checkbox"
           checked={checked}
           disabled={readOnly}
           onChange={() => toggle(item.id)}
           className="w-[18px] h-[18px] shrink-0 accent-emerald-700"
          />
          <span className="flex-1 min-w-0">
           <span className="block text-[13px] font-medium text-foreground">{item.label}</span>
           <span className="block text-[11px] font-mono text-muted-foreground truncate">{item.key}</span>
          </span>
          {changed && <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400">{checked ? 'Added' : 'Removed'}</span>}
         </label>
        );
       })}
      </div>
     </section>
    );
   })}
  </div>
 );
}
