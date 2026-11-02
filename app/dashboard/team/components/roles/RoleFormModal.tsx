"use client";

import { useState } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/Select';

const NO_DEPARTMENT = 'none';

export interface RoleFormValues {
 name: string;
 description: string;
 departmentId: string | null;
}

interface RoleFormModalProps {
 title: string;
 initial: RoleFormValues;
 nameLocked?: boolean;
 departments: { id: string; name: string }[];
 /** How many admins hold the role today; they move with it when its department changes. */
 holderCount?: number;
 onCancel: () => void;
 onSubmit: (values: RoleFormValues) => Promise<void>;
}

export default function RoleFormModal({ title, initial, nameLocked, departments, holderCount = 0, onCancel, onSubmit }: RoleFormModalProps) {
 const [form, setForm] = useState(initial);
 const [submitting, setSubmitting] = useState(false);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!form.name.trim()) return;
  setSubmitting(true);
  try {
   await onSubmit({ ...form, name: form.name.trim(), description: form.description.trim() });
  } finally {
   setSubmitting(false);
  }
 };

 return (
  <div className="fixed inset-0 z-modal flex items-center justify-center">
   <div className="fixed inset-0 bg-white/30 dark:bg-white/10 backdrop-blur-md" onClick={onCancel}></div>
   <div role="dialog" aria-modal="true" aria-label={title} className="relative bg-card rounded-2xl p-6 w-full max-w-md mx-4 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-black/10">
    <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
    <form onSubmit={handleSubmit} className="space-y-4">
     <label className="block text-sm font-medium text-foreground/90">
      Role name
      <input
       value={form.name}
       onChange={(e) => setForm({ ...form, name: e.target.value })}
       disabled={nameLocked}
       required
       autoFocus
       className="mt-1 w-full px-4 py-2.5 border border-border rounded-lg text-sm font-normal outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400 disabled:opacity-60"
      />
     </label>
     <label className="block text-sm font-medium text-foreground/90">
      Description
      <input
       value={form.description}
       onChange={(e) => setForm({ ...form, description: e.target.value })}
       placeholder="What does this role do?"
       className="mt-1 w-full px-4 py-2.5 border border-border rounded-lg text-sm font-normal outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400"
      />
     </label>
     <div className="block text-sm font-medium text-foreground/90">
      <span id="role-department-label">Department</span>
      <Select value={form.departmentId ?? NO_DEPARTMENT} onValueChange={(value) => setForm({ ...form, departmentId: value === NO_DEPARTMENT ? null : value })}>
       <SelectTrigger aria-labelledby="role-department-label" className="mt-1 w-full">
        <SelectValue placeholder="No department" />
       </SelectTrigger>
       <SelectContent>
        <SelectItem value={NO_DEPARTMENT}>No department</SelectItem>
        {departments.map((department) => <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>)}
       </SelectContent>
      </Select>
      {holderCount > 0 && form.departmentId !== initial.departmentId && (
       <p className="mt-1 text-xs font-normal text-amber-800 dark:text-amber-400">
        {holderCount} {holderCount === 1 ? 'admin' : 'admins'} holding this role will move to this department.
       </p>
      )}
     </div>
     <div className="flex gap-3 pt-2">
      <button type="button" onClick={onCancel} className="flex-1 h-11 rounded-lg text-sm text-foreground/90 bg-muted/50 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">Cancel</button>
      <button type="submit" disabled={submitting} className="flex-1 h-11 rounded-lg text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors disabled:opacity-50">
       {submitting ? 'Saving...' : 'Save'}
      </button>
     </div>
    </form>
   </div>
  </div>
 );
}
