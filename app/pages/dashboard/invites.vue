<template>
  <main class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-slate-800">Pending Invites</h1>
      <button @click="showInviteModal = true" class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
        Invite Admin
      </button>
    </div>

    <div v-if="loading" class="text-slate-500 py-12 text-center">Loading invites...</div>
    <div v-else-if="error" class="text-red-500 py-12 text-center">{{ error }}</div>
    
    <div v-else class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Invited At</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="invite in invites" :key="invite.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-medium">{{ invite.email }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{{ invite.role?.name || 'Unknown' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span class="px-2.5 py-1 text-xs rounded-full font-medium bg-amber-100 text-amber-800">
                {{ invite.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{{ new Date(invite.createdAt).toLocaleDateString() }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button @click="handleResend(invite.id)" class="text-emerald-600 hover:text-emerald-800 font-medium transition-colors">Resend</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="invites.length === 0" class="p-8 text-center text-slate-400">No pending invites.</div>
    </div>

    <!-- Invite Admin Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showInviteModal" class="fixed inset-0 z-[100] flex items-center justify-center">
          <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" @click="showInviteModal = false"></div>
          <div class="relative bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div class="flex items-start justify-between mb-4">
              <h3 class="text-lg font-semibold text-slate-800">Invite New Admin</h3>
              <button @click="showInviteModal = false" class="text-slate-400 hover:text-slate-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form @submit.prevent="handleCreateInvite" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input v-model="inviteForm.email" type="email" placeholder="admin@example.com" required class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Role ID</label>
                <input v-model="inviteForm.roleId" type="text" placeholder="Enter role ID to assign" required class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
              </div>
              <div class="flex items-center gap-3 justify-end mt-6">
                <button type="button" @click="showInviteModal = false" class="px-5 py-2.5 rounded-lg text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" :disabled="submitting" class="px-5 py-2.5 rounded-lg text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50">
                  {{ submitting ? 'Sending...' : 'Send Invite' }}
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
import { useInvites } from '~/composables/modules/useInvites';
import { useToast } from '@/composables/useToast';

definePageMeta({ layout: 'dashboard' });

const { loading, error, invites, fetchInvites, resendInvite, createInvite } = useInvites();
const { addToast } = useToast();

const showInviteModal = ref(false);
const submitting = ref(false);
const inviteForm = reactive({ email: '', roleId: '' });

onMounted(() => {
  fetchInvites();
});

const handleCreateInvite = async () => {
  if (!inviteForm.email.trim() || !inviteForm.roleId.trim()) return;
  submitting.value = true;
  try {
    await createInvite({
      email: inviteForm.email.trim(),
      roleId: inviteForm.roleId.trim()
    });
    addToast('Invite sent successfully!', 'success');
    showInviteModal.value = false;
    inviteForm.email = '';
    inviteForm.roleId = '';
    fetchInvites();
  } catch (e: any) {
    addToast(e?.response?.data?.message || 'Failed to send invite', 'error');
  } finally {
    submitting.value = false;
  }
};

const handleResend = async (id: string) => {
  try {
    await resendInvite(id);
    addToast('Invite resent successfully', 'success');
  } catch (e: any) {
    addToast(e?.response?.data?.message || 'Failed to resend invite', 'error');
  }
};
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
