<template>
  <main class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-slate-800">Clients Management</h1>
    </div>

    <div v-if="loading" class="text-slate-500 py-12 text-center">Loading clients...</div>
    <div v-else-if="error" class="text-red-500 py-12 text-center">{{ error }}</div>
    
    <div v-else class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="client in clients" :key="client.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-mono">{{ client.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{{ client.firstName }} {{ client.lastName }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{{ client.email }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span class="px-2.5 py-1 text-xs rounded-full font-medium" :class="statusClass(client.status)">
                {{ client.status || 'UNKNOWN' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
              <button @click="handleApprove(client.id)" v-if="client.status === 'MANUAL_REVIEW'" class="text-emerald-600 hover:text-emerald-800 transition-colors">Approve</button>
              <button @click="handleRetry(client.id)" class="text-amber-600 hover:text-amber-800 transition-colors">Retry</button>
              <button @click="handleRevoke(client.id)" class="text-rose-600 hover:text-rose-800 transition-colors">Revoke Sessions</button>
            </td>
          </tr>
          <tr v-if="clients.length === 0">
            <td colspan="5" class="p-8 text-center text-slate-400">No clients found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useClients } from '~/composables/modules/useClients';
import { useSessions } from '~/composables/modules/useSessions';
import { useToast } from '@/composables/useToast';

definePageMeta({ layout: 'dashboard' });

const { loading, error, clients, fetchClients, retryClient, approveClient } = useClients();
const { revokeClientSessions } = useSessions();
const { addToast } = useToast();

onMounted(() => {
  fetchClients();
});

const handleApprove = async (id: string) => {
  if (confirm('Approve this client?')) {
    try {
      await approveClient(id);
      addToast('Client approved successfully', 'success');
      fetchClients();
    } catch (e: any) {
      addToast(e?.response?.data?.message || 'Failed to approve client', 'error');
    }
  }
};

const handleRetry = async (id: string) => {
  if (confirm('Retry workflow for this client?')) {
    try {
      await retryClient(id);
      addToast('Client retry initiated', 'success');
      fetchClients();
    } catch (e: any) {
      addToast(e?.response?.data?.message || 'Failed to retry client', 'error');
    }
  }
};

const handleRevoke = async (id: string) => {
  if (confirm('Revoke all sessions for this client?')) {
    try {
      await revokeClientSessions(id);
      addToast('Sessions revoked', 'success');
    } catch (e: any) {
      addToast(e?.response?.data?.message || 'Failed to revoke sessions', 'error');
    }
  }
};

const statusClass = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'bg-emerald-100 text-emerald-800';
    case 'MANUAL_REVIEW': return 'bg-amber-100 text-amber-800';
    case 'FAILED': return 'bg-rose-100 text-rose-800';
    default: return 'bg-slate-100 text-slate-800';
  }
};
</script>
