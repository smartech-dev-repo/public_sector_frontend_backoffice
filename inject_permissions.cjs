const fs = require('fs');

const path = '/Users/marquis/public-sector/admin/app/dashboard/team/components/RolesTab.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Imports
content = content.replace(
  "import { useRoles } from '@/app/composables/modules/useRoles';",
  "import { useRoles } from '@/app/composables/modules/useRoles';\nimport { usePermissions } from '@/app/composables/modules/usePermissions';"
);

// 2. Hooks and state
content = content.replace(
  "const { loading, error, roles, fetchRoles, deleteRole, createRole, updateRole } = useRoles();",
  "const { loading, error, roles, fetchRoles, deleteRole, createRole, updateRole, assignBulkPermissions } = useRoles();\n  const { permissions: availablePermissions, fetchPermissions } = usePermissions();"
);

content = content.replace(
  "const [form, setForm] = useState({ name: '', description: '' });",
  "const [form, setForm] = useState({ name: '', description: '' });\n  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);"
);

// 3. useEffect
content = content.replace(
  /useEffect\(\(\) => \{\s+fetchRoles\(\);\s+\}, \[fetchRoles\]\);/,
  "useEffect(() => {\n    fetchRoles();\n    fetchPermissions();\n  }, [fetchRoles, fetchPermissions]);"
);

// 4. Modals
content = content.replace(
  /const openCreateModal = \(\) => {[\s\S]*?setShowCreateRole\(true\);\n  };/,
  `const openCreateModal = () => {
    setIsEditing(false);
    setEditId('');
    setForm({ name: '', description: '' });
    setSelectedPermissions([]);
    setShowCreateRole(true);
  };`
);

content = content.replace(
  /const openEditModal = \(role: any\) => {[\s\S]*?setShowCreateRole\(true\);\n  };/,
  `const openEditModal = (role: any) => {
    setIsEditing(true);
    setEditId(role.id);
    setForm({ name: role.name, description: role.description || '' });
    const currentPerms = role.permissions ? role.permissions.map((p: any) => p.permission?.id).filter(Boolean) : [];
    setSelectedPermissions(currentPerms);
    setShowCreateRole(true);
  };`
);

// 5. handleSaveRole
content = content.replace(
  /const handleSaveRole = async \(e: React\.FormEvent\) => {[\s\S]*?finally {\n      setSubmitting\(false\);\n    }\n  };/,
  `const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      if (isEditing) {
        await updateRole(editId, {
          name: form.name.trim(),
          description: form.description.trim()
        });
        if (selectedPermissions.length > 0) {
          await assignBulkPermissions(editId, { permissionIds: selectedPermissions });
        }
        addToast('Role updated successfully!', 'success');
      } else {
        const newRole = await createRole({
          name: form.name.trim(),
          description: form.description.trim()
        });
        const roleId = newRole?.id || newRole?.data?.id || newRole?.result?.id;
        if (roleId && selectedPermissions.length > 0) {
          await assignBulkPermissions(roleId, { permissionIds: selectedPermissions });
        }
        addToast('Role created successfully!', 'success');
      }
      setShowCreateRole(false);
      fetchRoles();
    } catch (e: any) {
      addToast(e?.response?.data?.message || 'Failed to save role', 'error');
    } finally {
      setSubmitting(false);
    }
  };`
);

// 6. UI Updates
content = content.replace(
  /<div className="relative bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">/g,
  '<div className="relative bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-2xl">'
);

const permissionsUI = `              </div>
              <div className="pt-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Assign Permissions</label>
                <div className="max-h-[300px] overflow-y-auto border border-slate-200 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50">
                  {availablePermissions?.map((perm: any) => (
                    <label key={perm.id} className="flex items-start gap-2 p-2 bg-white rounded border border-slate-100 hover:border-emerald-200 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                        checked={selectedPermissions.includes(perm.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPermissions(prev => [...prev, perm.id]);
                          } else {
                            setSelectedPermissions(prev => prev.filter(id => id !== perm.id));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-800">{perm.key}</div>
                        <div className="text-xs text-slate-500 leading-tight line-clamp-1" title={perm.description}>{perm.description}</div>
                      </div>
                    </label>
                  ))}
                  {(!availablePermissions || availablePermissions.length === 0) && (
                     <div className="text-sm text-slate-500 col-span-2 text-center py-4">No permissions available.</div>
                  )}
                </div>
              </div>
`;

content = content.replace(
  /<\/div>\s*<div className="flex items-center gap-3 justify-end mt-6">/g,
  permissionsUI + '              <div className="flex items-center gap-3 justify-end mt-6">'
);

fs.writeFileSync(path, content);
console.log('Done modifying RolesTab.tsx');
