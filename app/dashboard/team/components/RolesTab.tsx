"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRoles } from '@/app/composables/modules/useRoles';
import { useToast } from '@/app/composables/useToast';
import { useConfirm } from '@/app/composables/useConfirm';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import RolePermissionsEditor from './roles/RolePermissionsEditor';
import RoleMembersPanel from './roles/RoleMembersPanel';
import RoleHistoryPanel from './roles/RoleHistoryPanel';
import RoleCompareView from './roles/RoleCompareView';
import RoleFormModal, { RoleFormValues } from './roles/RoleFormModal';
import { groupPermissions, PermissionOption } from './roles/permissionGroups';

const SUPER_ADMIN = 'SUPER_ADMIN';

type RoleTab = 'permissions' | 'members' | 'history';
type RoleModal = { mode: 'create' | 'edit' | 'duplicate' } | null;

const adminCount = (role: any): number => role?._count?.admins ?? 0;
const adminLabel = (count: number) => `${count} ${count === 1 ? 'admin' : 'admins'}`;
const permissionIdsOf = (role: any): string[] => (role?.permissions || []).map((p: any) => p.permission?.id).filter(Boolean);

export default function RolesTab() {
 const { hasPermission, isSuperAdmin, roleName } = useAdminPermissions();
 const canManageRoles = isSuperAdmin || hasPermission('roles:manage');
 const canViewHistory = isSuperAdmin || hasPermission('audit:read');

 const { loading, error, roles, fetchAllRoles, fetchPermissionOptions, fetchDepartmentOptions, createRole, updateRole, deleteRole, setRolePermissions } = useRoles();
 const { addToast } = useToast();
 const { confirm } = useConfirm();

 const [options, setOptions] = useState<PermissionOption[]>([]);
 const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
 const [selectedId, setSelectedId] = useState('');
 // null means "no unsaved edits", so reloading the role never overwrites ticks in progress.
 const [draft, setDraft] = useState<string[] | null>(null);
 const [activeTab, setActiveTab] = useState<RoleTab>('permissions');
 const [comparing, setComparing] = useState(false);
 const [search, setSearch] = useState('');
 const [modal, setModal] = useState<RoleModal>(null);
 const [saving, setSaving] = useState(false);

 const load = useCallback(() => {
  fetchAllRoles();
  fetchPermissionOptions().then(setOptions).catch(() => setOptions([]));
  fetchDepartmentOptions().then(setDepartments).catch(() => setDepartments([]));
 }, [fetchAllRoles, fetchPermissionOptions, fetchDepartmentOptions]);

 useEffect(() => {
  if (canManageRoles) load();
 }, [canManageRoles, load]);

 useEffect(() => {
  if (!selectedId && roles.length > 0) setSelectedId(roles[0].id);
 }, [roles, selectedId]);

 const groups = useMemo(() => groupPermissions(options), [options]);
 const selectedRole = useMemo(() => roles.find((role) => role.id === selectedId) ?? null, [roles, selectedId]);
 const visibleRoles = useMemo(() => {
  const term = search.trim().toLowerCase();
  return term ? roles.filter((role) => role.name.toLowerCase().includes(term)) : roles;
 }, [roles, search]);

 const isLocked = selectedRole?.name === SUPER_ADMIN;
 const savedIds = useMemo(() => permissionIdsOf(selectedRole), [selectedRole]);
 const currentIds = draft ?? savedIds;
 const added = currentIds.filter((id) => !savedIds.includes(id));
 const removed = savedIds.filter((id) => !currentIds.includes(id));
 const isDirty = added.length + removed.length > 0;

 const confirmDiscard = async () => {
  if (!isDirty) return true;
  return confirm({ title: 'Discard changes?', message: `Your unsaved changes to ${selectedRole?.name} will be lost.`, confirmText: 'Discard' });
 };

 const selectRole = async (id: string) => {
  if (id === selectedId || !(await confirmDiscard())) return;
  setDraft(null);
  setSelectedId(id);
  setActiveTab('permissions');
 };

 // The API layer already shows the server's message for a rejected request; only a
 // request that never got an answer is left for us to report.
 const reportUnreachable = (e: any) => {
  if (!e?.status) addToast('Could not reach the server. Nothing was saved.', 'error');
 };

 const handleSave = async () => {
  if (!selectedRole) return;
  const roleManageId = options.find((option) => option.key === 'roles:manage')?.id;
  if (selectedRole.name === roleName && roleManageId && removed.includes(roleManageId)) {
   const proceed = await confirm({
    title: 'Remove your own access?',
    message: `You hold ${selectedRole.name}. Removing roles:manage means you will no longer be able to manage roles, and only another admin can give it back.`,
    confirmText: 'Remove my access',
   });
   if (!proceed) return;
  }
  setSaving(true);
  try {
   await setRolePermissions(selectedRole.id, currentIds);
   setDraft(null);
   await fetchAllRoles();
   const holders = adminCount(selectedRole);
   addToast(holders > 0 ? `Saved. Applies to ${adminLabel(holders)} within 15 minutes.` : 'Saved.', 'success');
  } catch (e) {
   reportUnreachable(e);
  } finally {
   setSaving(false);
  }
 };

 const handleDelete = async () => {
  if (!selectedRole) return;
  if (!(await confirm({ title: 'Delete role?', message: `Delete ${selectedRole.name}? This cannot be undone.`, confirmText: 'Delete' }))) return;
  try {
   await deleteRole(selectedRole.id);
   setDraft(null);
   setSelectedId('');
   await fetchAllRoles();
   addToast('Role deleted.', 'success');
  } catch (e) {
   reportUnreachable(e);
  }
 };

 const handleModalSubmit = async (values: RoleFormValues) => {
  try {
   if (modal?.mode === 'edit' && selectedRole) {
    await updateRole(selectedRole.id, isLocked ? { description: values.description, departmentId: values.departmentId } : values);
    await fetchAllRoles();
    addToast('Role details updated.', 'success');
   } else {
    const created = await createRole({ ...values, departmentId: values.departmentId ?? undefined });
    let copyFailed = false;
    if (modal?.mode === 'duplicate' && currentIds.length > 0) {
     copyFailed = await setRolePermissions(created.id, currentIds).then(() => false, () => true);
    }
    await fetchAllRoles();
    setDraft(null);
    setSelectedId(created.id);
    setActiveTab('permissions');
    addToast(copyFailed ? 'Role created, but its permissions were not copied.' : 'Role created.', copyFailed ? 'error' : 'success');
   }
   setModal(null);
  } catch (e) {
   reportUnreachable(e);
  }
 };

 const openCreate = async () => {
  if (await confirmDiscard()) {
   setDraft(null);
   setModal({ mode: 'create' });
  }
 };

 const modalInitial: RoleFormValues =
  modal?.mode === 'edit'
   ? { name: selectedRole?.name ?? '', description: selectedRole?.description ?? '', departmentId: selectedRole?.departmentId ?? null }
   : modal?.mode === 'duplicate'
    ? { name: `Copy of ${selectedRole?.name ?? ''}`, description: selectedRole?.description ?? '', departmentId: selectedRole?.departmentId ?? null }
    : { name: '', description: '', departmentId: null };

 const tabs: { id: RoleTab; label: string }[] = [
  { id: 'permissions', label: `Permissions ${currentIds.length} of ${options.length}` },
  { id: 'members', label: `Members ${adminCount(selectedRole)}` },
  ...(canViewHistory ? [{ id: 'history' as RoleTab, label: 'History' }] : []),
 ];

 if (!canManageRoles) {
  return <EmptyState title="You need the roles:manage permission to view roles." />;
 }

 return (
  <main className="w-full space-y-4">
   <div className="flex flex-wrap items-center justify-between gap-3">
    <p className="text-sm text-muted-foreground">
     {comparing ? 'Every role side by side. Go back to editing to change one.' : 'Pick a role, tick what it can do, then save.'}
    </p>
    <div className="flex gap-2">
     <button onClick={() => setComparing(!comparing)} className="h-11 px-4 border border-border bg-card text-foreground rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors">
      {comparing ? 'Back to editing' : 'Compare roles'}
     </button>
     <button onClick={openCreate} className="h-11 px-4 bg-emerald-700 text-white rounded-lg text-sm font-semibold hover:bg-emerald-800 transition-colors">
      Create role
     </button>
    </div>
   </div>

   {loading && roles.length === 0 && <PulseLoader />}
   {!loading && error && roles.length === 0 && (
    <div className="text-center py-12">
     <p className="text-red-600 mb-3">Could not load roles.</p>
     <button onClick={load} className="h-11 px-4 border border-border rounded-lg text-sm font-medium">Try again</button>
    </div>
   )}
   {!loading && !error && roles.length === 0 && <EmptyState title="No roles yet." />}

   {roles.length > 0 && comparing && <RoleCompareView roles={roles} groups={groups} />}

   {roles.length > 0 && !comparing && (
    <div className="flex flex-col lg:flex-row gap-4 items-start">
     <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-4 bg-card border border-border rounded-2xl p-2.5 space-y-1.5">
      <input
       value={search}
       onChange={(e) => setSearch(e.target.value)}
       aria-label="Search roles"
       placeholder="Search roles"
       className="w-full h-11 px-3 bg-card border border-border rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400"
      />
      <div className="max-h-60 lg:max-h-[70vh] overflow-y-auto space-y-1">
       {visibleRoles.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No roles match.</p>}
       {visibleRoles.map((role) => (
        <button
         key={role.id}
         onClick={() => selectRole(role.id)}
         aria-current={role.id === selectedId}
         className={`w-full min-h-[60px] px-3 py-2 text-left rounded-lg border transition-colors ${role.id === selectedId ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20' : 'border-transparent hover:bg-muted/50'}`}
        >
         <span className="block text-sm font-semibold text-foreground truncate">{role.name}</span>
         <span className="block text-xs text-muted-foreground truncate">{role.department?.name || 'No department'}</span>
         <span className="block text-xs text-muted-foreground">
          {permissionIdsOf(role).length} of {options.length} · {role.name === SUPER_ADMIN ? 'locked' : adminLabel(adminCount(role))}
         </span>
        </button>
       ))}
      </div>
     </aside>

     {selectedRole && (
      <section aria-label={selectedRole.name} className="flex-1 min-w-0 w-full bg-card border border-border rounded-2xl overflow-clip">
       <div className="p-5 border-b border-border space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
         <div className="min-w-0">
          <h2 className="text-lg font-bold text-foreground break-words">{selectedRole.name}</h2>
          <p className="text-sm text-muted-foreground">{selectedRole.description || 'No description'}</p>
          <p className="text-sm text-foreground/90 mt-1"><span className="text-muted-foreground">Department:</span> {selectedRole.department?.name || 'None'}</p>
          <p className="text-xs text-muted-foreground mt-1">
           Updated {new Date(selectedRole.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
         </div>
         <div className="flex flex-wrap gap-2">
          <button onClick={() => setModal({ mode: 'edit' })} className="h-11 px-3.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">Edit details</button>
          <button onClick={() => setModal({ mode: 'duplicate' })} className="h-11 px-3.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">Duplicate</button>
          {!isLocked && (
           <button
            onClick={handleDelete}
            disabled={adminCount(selectedRole) > 0}
            title={adminCount(selectedRole) > 0 ? 'Move its admins to another role first' : undefined}
            className="h-11 px-3.5 border border-border rounded-lg text-sm font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
           >
            Delete
           </button>
          )}
         </div>
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
        {activeTab === 'permissions' && (
         <>
          {isLocked && (
           <p className="mb-4 px-3 py-2.5 rounded-lg bg-muted/50 text-sm text-foreground/90">
            {SUPER_ADMIN} always holds every permission, so it can't be edited here.
           </p>
          )}
          <RolePermissionsEditor groups={groups} savedIds={savedIds} selectedIds={currentIds} readOnly={isLocked} onChange={setDraft} />
         </>
        )}
        {activeTab === 'members' && <RoleMembersPanel roleId={selectedRole.id} />}
        {activeTab === 'history' && <RoleHistoryPanel roleId={selectedRole.id} version={selectedRole.updatedAt} />}
       </div>

       {activeTab === 'permissions' && !isLocked && (
        <div className="sticky bottom-0 px-5 py-3 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card">
         <span className="text-sm font-medium text-foreground/90">
          {isDirty ? `${added.length} added, ${removed.length} removed · applies to ${adminLabel(adminCount(selectedRole))}` : 'No unsaved changes'}
         </span>
         <div className="flex gap-2">
          <button onClick={() => setDraft(null)} disabled={!isDirty || saving} className="h-11 px-4 border border-border rounded-lg text-sm font-semibold text-foreground disabled:opacity-50">Discard</button>
          <button onClick={handleSave} disabled={!isDirty || saving} className="h-11 px-4 rounded-lg text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50">
           {saving ? 'Saving...' : 'Save changes'}
          </button>
         </div>
        </div>
       )}
      </section>
     )}
    </div>
   )}

   {modal && (
    <RoleFormModal
     key={modal.mode}
     title={modal.mode === 'edit' ? 'Edit role details' : modal.mode === 'duplicate' ? `Duplicate ${selectedRole?.name}` : 'Create role'}
     initial={modalInitial}
     nameLocked={modal.mode === 'edit' && isLocked}
     departments={departments}
     holderCount={modal.mode === 'edit' ? adminCount(selectedRole) : 0}
     onCancel={() => setModal(null)}
     onSubmit={handleModalSubmit}
    />
   )}
  </main>
 );
}
