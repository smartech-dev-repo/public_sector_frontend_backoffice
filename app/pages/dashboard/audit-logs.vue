<template>
  <main class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-slate-800">Audit Logs</h1>
    </div>

    <div v-if="loading" class="text-slate-500 py-12 text-center">Loading audit logs...</div>
    <div v-else-if="error" class="text-red-500 py-12 text-center">{{ error }}</div>
    
    <div v-else class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actor</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Target</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="log in logs" :key="log.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{{ new Date(log.createdAt).toLocaleString() }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-medium">{{ log.action }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{{ log.actorType }} ({{ log.actorId }})</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{{ log.targetType }} ({{ log.targetId }})</td>
          </tr>
        </tbody>
      </table>
      <div v-if="logs.length === 0" class="p-8 text-center text-slate-400">No audit logs found.</div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuditLogs } from '~/composables/modules/useAuditLogs';

definePageMeta({
  layout: 'dashboard'
});

const { loading, error, logs, fetchLogs } = useAuditLogs();

onMounted(() => {
  fetchLogs();
});
</script>
