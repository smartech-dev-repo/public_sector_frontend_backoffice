<template>
  <div class="space-y-6">
    <div v-if="loading" class="py-20 text-center text-slate-500">
      Loading agents...
    </div>
    <div v-else class="space-y-6">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-semibold text-slate-800">Agent Applications</h1>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-2xl border border-slate-200">
          <div class="text-sm text-slate-500 uppercase tracking-wider mb-2">Pending Review</div>
          <div class="text-3xl text-slate-800">{{ pendingCount }}</div>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-slate-200">
          <div class="text-sm text-slate-500 uppercase tracking-wider mb-2">Approved</div>
          <div class="text-3xl text-emerald-600">{{ approvedCount }}</div>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-slate-200">
          <div class="text-sm text-slate-500 uppercase tracking-wider mb-2">Total Agents</div>
          <div class="text-3xl text-emerald-600">{{ agents.length }}</div>
        </div>
      </div>
      
      <!-- Queue Table -->
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th scope="col" class="px-6 py-4 tracking-wider">Application Ref (ID)</th>
                <th scope="col" class="px-6 py-4 tracking-wider">Applicant Name</th>
                <th scope="col" class="px-6 py-4 tracking-wider">Date Submitted</th>
                <th scope="col" class="px-6 py-4 tracking-wider">Status</th>
                <th scope="col" class="px-6 py-4 tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="agents.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-slate-500">No applications found.</td>
              </tr>
              <tr v-for="app in agents" :key="app.id" class="hover:bg-slate-50/50 transition-colors">
                <td class="px-6 py-4 font-mono text-slate-600">{{ app.id }}</td>
                <td class="px-6 py-4 font-medium text-slate-800">{{ app.firstName }} {{ app.lastName }}</td>
                <td class="px-6 py-4 text-slate-600">{{ new Date(app.createdAt).toLocaleDateString() }}</td>
                <td class="px-6 py-4">
                  <span class="px-3 py-1.5 rounded-lg text-xs whitespace-nowrap"
                        :class="statusClass(app.status)">
                    {{ app.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <NuxtLink :to="`/dashboard/agent/${app.id}`" class="text-emerald-600 hover:text-emerald-800 font-medium">
                    Review Application
                  </NuxtLink>
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
import { computed, onMounted } from 'vue';
import { useAgents } from '~/composables/modules/useAgents';

definePageMeta({ layout: 'dashboard' });

const { loading, error, agents, fetchAgents } = useAgents();

onMounted(() => {
  fetchAgents();
});

const pendingCount = computed(() => agents.value.filter((a: any) => a.status === 'PENDING').length);
const approvedCount = computed(() => agents.value.filter((a: any) => a.status === 'APPROVED').length);

const statusClass = (status: string) => {
  switch (status) {
    case 'PENDING': return 'bg-amber-100 text-amber-700';
    case 'APPROVED': return 'bg-emerald-100 text-emerald-700';
    case 'REJECTED': return 'bg-rose-100 text-rose-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};
</script>
