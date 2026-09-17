<template>
  <main class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-slate-800">Admin Users</h1>
    </div>

    <div v-if="loading" class="text-slate-500 py-12 text-center">Loading admins...</div>
    <div v-else-if="error" class="text-red-500 py-12 text-center">{{ error }}</div>
    
    <div v-else class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="admin in admins" :key="admin.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-mono">{{ admin.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{{ admin.email }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{{ admin.firstName }} {{ admin.lastName }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
              <button @click="openAssignRoleModal(admin)" class="text-emerald-600 hover:text-emerald-800 font-medium transition-colors">Assign Role</button>
              <button @click="openRemoveRoleModal(admin)" class="text-rose-600 hover:text-rose-800 font-medium transition-colors">Remove Role</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="admins.length === 0" class="p-8 text-center text-slate-400">No admins found.</div>
    </div>

    <!-- Assign Role Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAssignModal" class="fixed inset-0 z-[100] flex items-center justify-center">
          <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" @click="showAssignModal = false"></div>
          <div class="relative bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div class="flex items-start justify-between mb-4">
              <h3 class="text-lg font-semibold text-slate-800">Assign Role to {{ selectedAdmin?.email }}</h3>
              <button @click="showAssignModal = false" class="text-slate-400 hover:text-slate-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Role ID</label>
                <input v-model="assignRoleForm.roleId" type="text" placeholder="Enter role ID" class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
              </div>
            </div>
            <div class="flex items-center gap-3 justify-end mt-6">
              <button @click="showAssignModal = false" class="px-5 py-2.5 rounded-lg text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
              <button @click="handleAssignRole" :disabled="submitting" class="px-5 py-2.5 rounded-lg text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50">
                {{ submitting ? 'Assigning...' : 'Assign Role' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Remove Role Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showRemoveModal" class="fixed inset-0 z-[100] flex items-center justify-center">
          <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" @click="showRemoveModal = false"></div>
          <div class="relative bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div class="flex items-start justify-between mb-4">
              <h3 class="text-lg font-semibold text-slate-800">Remove Role from {{ selectedAdmin?.email }}</h3>
              <button @click="showRemoveModal = false" class="text-slate-400 hover:text-slate-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Role ID to Remove</label>
                <input v-model="removeRoleForm.roleId" type="text" placeholder="Enter role ID to remove" class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
              </div>
            </div>
            <div class="flex items-center gap-3 justify-end mt-6">
              <button @click="showRemoveModal = false" class="px-5 py-2.5 rounded-lg text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
              <button @click="handleRemoveRole" :disabled="submitting" class="px-5 py-2.5 rounded-lg text-sm text-white bg-rose-600 hover:bg-rose-700 transition-colors disabled:opacity-50">
                {{ submitting ? 'Removing...' : 'Remove Role' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue';
import { useAdmins } from '~/composables/modules/useAdmins';
import { useToast } from '@/composables/useToast';

definePageMeta({ layout: 'dashboard' });

const { loading, error, admins, fetchAdmins, assignRole, removeRole } = useAdmins();
const { addToast } = useToast();

const showAssignModal = ref(false);
const showRemoveModal = ref(false);
const submitting = ref(false);
const selectedAdmin = ref<any>(null);
const assignRoleForm = reactive({ roleId: '' });
const removeRoleForm = reactive({ roleId: '' });

const openAssignRoleModal = (admin: any) => {
  selectedAdmin.value = admin;
  assignRoleForm.roleId = '';
  showAssignModal.value = true;
};

const openRemoveRoleModal = (admin: any) => {
  selectedAdmin.value = admin;
  removeRoleForm.roleId = '';
  showRemoveModal.value = true;
};

const handleAssignRole = async () => {
  if (!assignRoleForm.roleId.trim()) { addToast('Role ID is required', 'error'); return; }
  submitting.value = true;
  try {
    await assignRole(selectedAdmin.value.id, { roleId: assignRoleForm.roleId.trim() });
    addToast('Role assigned successfully!', 'success');
    showAssignModal.value = false;
    fetchAdmins();
  } catch (e: any) {
    addToast(e?.response?.data?.message || 'Failed to assign role', 'error');
  } finally {
    submitting.value = false;
  }
};

const handleRemoveRole = async () => {
  if (!removeRoleForm.roleId.trim()) { addToast('Role ID is required', 'error'); return; }
  submitting.value = true;
  try {
    await removeRole(selectedAdmin.value.id, removeRoleForm.roleId.trim());
    addToast('Role removed successfully!', 'success');
    showRemoveModal.value = false;
    fetchAdmins();
  } catch (e: any) {
    addToast(e?.response?.data?.message || 'Failed to remove role', 'error');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => { fetchAdmins(); });
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
