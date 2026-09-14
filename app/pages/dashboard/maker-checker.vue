<template>
 <div class="space-y-6">
    <div v-if="isLoading" class="py-20">
      <UiPulseLoader />
    </div>
    <div v-else class="space-y-6">
 <div class="flex items-center justify-between mb-8">
 <div class="bg-white rounded-lg border border-slate-200 px-4 py-2 flex items-center gap-2">
 <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
 <span class="text-sm font-medium text-slate-600">Live Updates</span>
 </div>
 </div>

 <!-- Stats -->
 <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
 <div class="bg-white p-6 rounded-2xl border border-slate-200">
 <div class="text-sm text-slate-500 uppercase tracking-wider mb-2">Pending Review</div>
 <div class="text-3xl text-slate-800">{{ pendingCount }}</div>
 </div>
 <div class="bg-white p-6 rounded-2xl border border-slate-200">
 <div class="text-sm text-slate-500 uppercase tracking-wider mb-2">Approved Today</div>
 <div class="text-3xl text-emerald-600">{{ approvedCount }}</div>
 </div>
 <div class="bg-white p-6 rounded-2xl border border-slate-200">
 <div class="text-sm text-slate-500 uppercase tracking-wider mb-2">Total Agents</div>
 <div class="text-3xl text-emerald-600">{{ agentApplications.length }}</div>
 </div>
 </div>

 <!-- Queue Table -->
 <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
 <div class="overflow-x-auto">
 <table class="w-full text-sm text-left">
 <thead class="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
 <tr>
 <th scope="col" class="px-6 py-4 tracking-wider">Application Ref</th>
 <th scope="col" class="px-6 py-4 tracking-wider">Applicant Name</th>
 <th scope="col" class="px-6 py-4 tracking-wider">Date Submitted</th>
 <th scope="col" class="px-6 py-4 tracking-wider">Status</th>
 <th scope="col" class="px-6 py-4 tracking-wider text-right">Action</th>
 </tr>
 </thead>
 <tbody class="divide-y divide-slate-100">
 <tr v-for="app in agentApplications" :key="app.id" class="hover:bg-slate-50/50 transition-colors">
 <td class="px-6 py-4 font-mono text-slate-600">{{ app.id }}</td>
 <td class="px-6 py-4 font-medium text-slate-800">{{ app.name }}</td>
 <td class="px-6 py-4 text-slate-600">{{ app.dateSubmitted }}</td>
 <td class="px-6 py-4">
 <span class="px-3 py-1.5 rounded-lg text-xs whitespace-nowrap"
 :class="{ 'bg-amber-100 text-amber-700': app.status === 'Pending Review', 'bg-emerald-100 text-emerald-700': app.status === 'Approved', 'bg-rose-100 text-rose-700': app.status === 'Rejected' }">
 {{ app.status }}
 </span>
 </td>
 <td class="px-6 py-4 text-right">
 <div class="flex justify-end">
 <UiTableDropdown>
 <NuxtLink :to="`/dashboard/agent/${app.id}`" class="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
 Review Application
 </NuxtLink>
 </UiTableDropdown>
 </div>
 </td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>
 </div>
    </div>
</template>

<script setup>
import UiPulseLoader from '@/components/ui/PulseLoader.vue';
import { computed, onMounted, ref } from 'vue';

const isLoading = ref(true);

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 800);
});

import { useMockData } from '@/composables/modules/useMockData';
import UiTableDropdown from '@/components/ui/TableDropdown.vue';

definePageMeta({
 layout: 'dashboard'
});

const { agentApplications } = useMockData();

const pendingCount = computed(() => agentApplications.filter(a => a.status === 'Pending Review').length);
const approvedCount = computed(() => agentApplications.filter(a => a.status === 'Approved').length);
</script>
