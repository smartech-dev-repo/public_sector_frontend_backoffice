<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between mb-6">
      <NuxtLink to="/dashboard/maker-checker" class="flex items-center text-sm text-slate-500 hover:text-emerald-600 transition-colors">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        Back to Queue
      </NuxtLink>
      <span v-if="application" class="px-3 py-1.5 rounded-lg text-xs whitespace-nowrap"
        :class="statusClass(application.status)">
        {{ application.status }}
      </span>
    </div>

    <div v-if="loading" class="text-center py-20 text-slate-500">Loading application...</div>
    <div v-else-if="!application" class="text-center py-20 text-slate-500">Application not found.</div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:p-6">
      <!-- Applicant Info -->
      <div class="col-span-2 space-y-6">
        <div class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-4 sm:p-6">
          <h2 class="text-xl text-slate-800 mb-6 border-b border-slate-100 pb-4">Applicant Information</h2>
          <div class="grid grid-cols-2 gap-y-6 gap-x-4">
            <div>
              <div class="text-xs text-slate-400 uppercase tracking-wider mb-1">Full Name</div>
              <div class="font-medium text-slate-800 text-lg">{{ application.firstName }} {{ application.lastName }}</div>
            </div>
            <div>
              <div class="text-xs text-slate-400 uppercase tracking-wider mb-1">Application Ref (ID)</div>
              <div class="font-mono text-slate-800">{{ application.id }}</div>
            </div>
            <div>
              <div class="text-xs text-slate-400 uppercase tracking-wider mb-1">Email</div>
              <div class="font-medium text-slate-800">{{ application.email }}</div>
            </div>
            <div>
              <div class="text-xs text-slate-400 uppercase tracking-wider mb-1">Submission Date</div>
              <div class="font-medium text-slate-800">{{ new Date(application.createdAt).toLocaleDateString() }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="space-y-6">
        <div v-if="application.status === 'PENDING'" class="bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-6 text-white">
          <h2 class="text-lg mb-4">Internal Control (Checker)</h2>
          <p class="text-sm text-slate-400 mb-6">Review the applicant's details and approve or reject.</p>
          
          <div class="space-y-3">
            <button @click="handleApprove" :disabled="submitting" class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors disabled:opacity-50">
              {{ submitting ? 'Processing...' : 'Approve Agent' }}
            </button>
            <button @click="handleReject" :disabled="submitting" class="w-full py-3 bg-transparent border-2 border-rose-500/30 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors disabled:opacity-50">
              {{ submitting ? 'Processing...' : 'Reject Application' }}
            </button>
          </div>
        </div>

        <div v-if="application.status === 'APPROVED'" class="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">
          <h2 class="text-lg mb-4 text-slate-800">Agent Actions</h2>
          <div class="space-y-3">
            <button @click="handleResendCredentials" class="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors font-medium">
              Resend Credentials
            </button>
            <button @click="handleRevokeSessions" class="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors font-medium">
              Revoke Sessions
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAgents } from '~/composables/modules/useAgents';
import { useSessions } from '~/composables/modules/useSessions';
import { useToast } from '@/composables/useToast';

definePageMeta({ layout: 'dashboard' });

const route = useRoute();
const router = useRouter();
const { getAgentById, approveAgent, rejectAgent, resendCredentials } = useAgents();
const { revokeAgentSessions } = useSessions();
const { addToast } = useToast();

const application = ref<any>(null);
const loading = ref(true);
const submitting = ref(false);

const fetchAgentDetails = async () => {
  loading.value = true;
  try {
    application.value = await getAgentById(route.params.id as string);
  } catch (err: any) {
    addToast('Failed to load agent details', 'error');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchAgentDetails();
});

const handleApprove = async () => {
  if (!confirm('Are you sure you want to approve this agent?')) return;
  submitting.value = true;
  try {
    await approveAgent(application.value.id);
    addToast('Agent approved successfully', 'success');
    await fetchAgentDetails();
  } catch (err: any) {
    addToast(err?.response?.data?.message || 'Failed to approve', 'error');
  } finally {
    submitting.value = false;
  }
};

const handleReject = async () => {
  if (!confirm('Are you sure you want to reject this agent?')) return;
  submitting.value = true;
  try {
    await rejectAgent(application.value.id);
    addToast('Agent rejected successfully', 'success');
    await fetchAgentDetails();
  } catch (err: any) {
    addToast(err?.response?.data?.message || 'Failed to reject', 'error');
  } finally {
    submitting.value = false;
  }
};

const handleResendCredentials = async () => {
  if (!confirm('Are you sure you want to resend credentials?')) return;
  try {
    await resendCredentials(application.value.id);
    addToast('Credentials resent successfully', 'success');
  } catch (err: any) {
    addToast(err?.response?.data?.message || 'Failed to resend credentials', 'error');
  }
};

const handleRevokeSessions = async () => {
  if (!confirm('Are you sure you want to revoke all sessions for this agent?')) return;
  try {
    await revokeAgentSessions(application.value.id);
    addToast('Sessions revoked successfully', 'success');
  } catch (err: any) {
    addToast(err?.response?.data?.message || 'Failed to revoke sessions', 'error');
  }
};

const statusClass = (status: string) => {
  switch (status) {
    case 'PENDING': return 'bg-amber-100 text-amber-700';
    case 'APPROVED': return 'bg-emerald-100 text-emerald-700';
    case 'REJECTED': return 'bg-rose-100 text-rose-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};
</script>
