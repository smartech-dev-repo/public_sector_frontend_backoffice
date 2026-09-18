<template>
  <div class="space-y-6">
    <div v-if="loading" class="py-20 text-center text-slate-500">
      Loading agents...
    </div>
    <div v-else class="space-y-6">
      <div class="flex justify-between items-end">
        <div>
          <p class="text-sm text-slate-500 mt-1">Monitor agent activity and enforce immediate session revocation for flagged agents.</p>
        </div>
      </div>

      <!-- Alert -->
      <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <svg class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        <div>
          <h4 class="text-sm text-amber-900">Immediate Access Revocation (SOP 10)</h4>
          <p class="text-xs text-amber-700 mt-1 leading-relaxed">Revoking an agent immediately terminates their active sessions. This action is fully audited.</p>
        </div>
      </div>

      <!-- Agent List -->
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th scope="col" class="px-6 py-4 tracking-wider">Agent Details</th>
                <th scope="col" class="px-6 py-4 tracking-wider">Status</th>
                <th scope="col" class="px-6 py-4 tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="approvedAgents.length === 0">
                <td colspan="3" class="px-6 py-8 text-center text-slate-500">No active agents found.</td>
              </tr>
              <tr v-for="agent in approvedAgents" :key="agent.id" class="hover:bg-slate-50/50 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-medium">
                      {{ agent.firstName?.charAt(0) || 'A' }}
                    </div>
                    <div>
                      <div class="text-slate-800 font-medium">{{ agent.firstName }} {{ agent.lastName }}</div>
                      <div class="text-xs font-mono text-slate-500 mt-0.5">{{ agent.id }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 rounded-md text-xs whitespace-nowrap bg-emerald-100 text-emerald-700">
                    {{ agent.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <button @click="handleRevoke(agent)" :disabled="revokingId === agent.id" class="px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200">
                    {{ revokingId === agent.id ? 'Revoking...' : 'Revoke All Sessions' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useAgents } from '~/composables/modules/useAgents';
import { useSessions } from '~/composables/modules/useSessions';
import { useToast } from '@/composables/useToast';

definePageMeta({ layout: 'dashboard' });

const { loading, error, agents, fetchAgents } = useAgents();
const { revokeAgentSessions } = useSessions();
const { addToast } = useToast();

const revokingId = ref('');

onMounted(() => {
  fetchAgents();
});

const approvedAgents = computed(() => {
  return agents.value.filter((a: any) => a.status === 'APPROVED');
});

const handleRevoke = async (agent: any) => {
  if (!confirm(`Are you sure you want to revoke all sessions for ${agent.firstName}?`)) return;
  revokingId.value = agent.id;
  try {
    await revokeAgentSessions(agent.id);
    addToast('Sessions revoked successfully', 'success');
  } catch (err: any) {
    addToast(err?.response?.data?.message || 'Failed to revoke sessions', 'error');
  } finally {
    revokingId.value = '';
  }
};
</script>
