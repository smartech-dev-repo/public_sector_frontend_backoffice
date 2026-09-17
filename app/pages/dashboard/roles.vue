<template>
  <main class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-slate-800">Role Management</h1>
      <button @click="showCreateRole = true" class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
        Create Role
      </button>
    </div>

    <div v-if="loading" class="text-slate-500 py-12 text-center">Loading roles...</div>
    <div v-else-if="error" class="text-red-500 py-12 text-center">{{ error }}</div>
    
    <div v-else class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="role in roles" :key="role.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-mono">{{ role.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-medium">{{ role.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{{ role.description }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button @click="handleDelete(role.id)" class="text-rose-600 hover:text-rose-800 font-medium transition-colors">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="roles.length === 0" class="p-8 text-center text-slate-400">No roles found.</div>
    </div>

    <!-- Create Role Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCreateRole" class="fixed inset-0 z-[100] flex items-center justify-center">
          <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" @click="showCreateRole = false"></div>
          <div class="relative bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div class="flex items-start justify-between mb-4">
              <h3 class="text-lg font-semibold text-slate-800">Create New Role</h3>
              <button @click="showCreateRole = false" class="text-slate-400 hover:text-slate-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form @submit.prevent="handleCreateRole" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Role Name</label>
                <input v-model="createRoleForm.name" type="text" placeholder="e.g. SUPER_ADMIN" required class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input v-model="createRoleForm.description" type="text" placeholder="What does this role do?" class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
              </div>
              <div class="flex items-center gap-3 justify-end mt-6">
                <button type="button" @click="showCreateRole = false" class="px-5 py-2.5 rounded-lg text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" :disabled="submitting" class="px-5 py-2.5 rounded-lg text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50">
                  {{ submitting ? 'Creating...' : 'Create Role' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue';
import { useRoles } from '~/composables/modules/useRoles';
import { useToast } from '@/composables/useToast';

definePageMeta({ layout: 'dashboard' });

const { loading, error, roles, fetchRoles, deleteRole, createRole } = useRoles();
const { addToast } = useToast();

const showCreateRole = ref(false);
const submitting = ref(false);
const createRoleForm = reactive({ name: '', description: '' });

onMounted(() => {
  fetchRoles();
});

const handleCreateRole = async () => {
  if (!createRoleForm.name.trim()) return;
  submitting.value = true;
  try {
    await createRole({
      name: createRoleForm.name.trim(),
      description: createRoleForm.description.trim()
    });
    addToast('Role created successfully!', 'success');
    showCreateRole.value = false;
    createRoleForm.name = '';
    createRoleForm.description = '';
    fetchRoles();
  } catch (e: any) {
    addToast(e?.response?.data?.message || 'Failed to create role', 'error');
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async (id: string) => {
  if (confirm('Are you sure you want to delete this role?')) {
    try {
      await deleteRole(id);
      addToast('Role deleted successfully', 'success');
      fetchRoles();
    } catch (e: any) {
      addToast(e?.response?.data?.message || 'Failed to delete role', 'error');
    }
  }
};
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
