<template>
 <div class="space-y-6">
    <div v-if="isLoading" class="py-20">
      <UiPulseLoader />
    </div>
    <div v-else class="space-y-6">
 <div>
 <p class="text-sm text-slate-500 mt-1">System of record for all high-risk operations and access changes.</p>
 </div>

 <!-- Alert -->
 <div class="bg-slate-800 rounded-xl p-4 flex items-start gap-3 border border-slate-700">
 <svg class="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
 <div>
 <h4 class="text-sm text-white">Read-Only View (SOP 11)</h4>
 <p class="text-xs text-slate-300 mt-1 leading-relaxed">This log is immutable. Records cannot be edited or deleted. It tracks the actor, timestamp, target record, and mandatory justification for every critical platform action.</p>
 </div>
 </div>

 <!-- Filters -->
 <div class="bg-white rounded-2xl p-4 border border-slate-200 flex items-center gap-4">
 <div class="flex-1">
 <input type="text" placeholder="Search logs..." class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500 transition-colors" />
 </div>
      <ClientOnly>
        <flat-pickr v-model="selectedDate" class="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500 transition-colors text-slate-600 min-w-[150px]" placeholder="Select Date" />
      </ClientOnly>
 <button class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2">
 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
 Export CSV
 </button>
 </div>

 <!-- Log List -->
 <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
 <div class="overflow-x-auto">
 <table class="w-full text-left border-collapse">
 <thead>
 <tr class="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 ">
 <th class="px-6 py-4">Timestamp (UTC)</th>
 <th class="px-6 py-4">Actor</th>
 <th class="px-6 py-4">Action Event</th>
 <th class="px-6 py-4">Target Ref</th>
 <th class="px-6 py-4">Recorded Reason</th>
 </tr>
 </thead>
 <tbody class="divide-y divide-slate-100 text-sm">
 <tr v-for="log in auditLogs" :key="log.id" class="hover:bg-slate-50/50 transition-colors group">
 <td class="px-6 py-4 font-mono text-slate-500 whitespace-nowrap">{{ new Date(log.timestamp).toLocaleString('en-GB') }}</td>
 <td class="px-6 py-4 font-medium text-slate-800">{{ log.actor }}</td>
 <td class="px-6 py-4">
 <span class="px-2.5 py-1 rounded-md text-xs whitespace-nowrap" :class="{ 'bg-rose-100 text-rose-700': log.action.includes('Suspend') || log.action.includes('Reject'), 'bg-emerald-100 text-emerald-700': log.action.includes('Approve') || log.action.includes('Complete'), 'bg-blue-100 text-blue-700': log.action.includes('Export') || log.action.includes('Upload') }">{{ log.action }}</span>
 </td>
 <td class="px-6 py-4 font-mono text-slate-600">{{ log.target }}</td>
 <td class="px-6 py-4 text-slate-600 text-xs">{{ log.reason }}</td>
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
import { onMounted, ref } from 'vue';
import { useMockData } from '@/composables/modules/useMockData';
import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';

const isLoading = ref(true);

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 800);
});

definePageMeta({
  layout: 'dashboard'
});

const { auditLogs } = useMockData();
const selectedDate = ref(null);
</script>
