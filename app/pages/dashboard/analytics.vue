<template>
 <div class="space-y-6">
    <div v-if="isLoading" class="py-20">
      <UiPulseLoader />
    </div>
    <div v-else class="space-y-6">
 <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
 <div>
 <p class="text-sm text-slate-500">View platform performance metrics and download segmented data for analysis.</p>
 </div>
 
 <div class="flex flex-wrap items-center gap-3">
 <div class="w-48">
 <UiSelect 
 :options="[{label: 'Last 30 Days', value: '30d'}, {label: 'This Quarter', value: 'Q'}, {label: 'Year to Date', value: 'YTD'}]" 
 :modelValue="'30d'"
 />
 </div>
 <button @click="downloadReport" class="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 py-2 px-4 rounded-lg flex items-center gap-2 transition-colors border border-emerald-200">
 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
 Export CSV
 </button>
 </div>
 </div>

 <!-- KPIs -->
 <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 <div class="bg-white rounded-2xl p-6 border border-slate-200">
 <div class="text-xs text-slate-400 uppercase tracking-wider mb-2">Total Loans Originated</div>
 <div class="text-3xl text-slate-800">{{ analyticsStats.totalLoansOriginated.toLocaleString() }}</div>
 <div class="text-sm text-emerald-600 mt-2 font-medium flex items-center gap-1">
 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
 +14% from last month
 </div>
 </div>
 <div class="bg-white rounded-2xl p-6 border border-slate-200">
 <div class="text-xs text-slate-400 uppercase tracking-wider mb-2">Total Volume Disbursed</div>
 <div class="text-3xl text-slate-800">₦{{ (analyticsStats.totalVolume / 1000000).toFixed(1) }}M</div>
 <div class="text-sm text-emerald-600 mt-2 font-medium flex items-center gap-1">
 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
 +8.2% from last month
 </div>
 </div>
 <div class="bg-white rounded-2xl p-6 border border-slate-200">
 <div class="text-xs text-slate-400 uppercase tracking-wider mb-2">Avg. Turnaround Time</div>
 <div class="text-3xl text-slate-800">{{ analyticsStats.averageTurnaround }}</div>
 <div class="text-sm text-emerald-600 mt-2 font-medium flex items-center gap-1">
 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
 -1.5 hrs from last month
 </div>
 </div>
 <div class="bg-white rounded-2xl p-6 border border-slate-200">
 <div class="text-xs text-slate-400 uppercase tracking-wider mb-2">Active Field Agents</div>
 <div class="text-3xl text-slate-800">{{ analyticsStats.activeAgents }}</div>
 <div class="text-sm text-emerald-600 mt-2 font-medium flex items-center gap-1">
 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
 +12 new this month
 </div>
 </div>
 </div>

 <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <!-- Agent Performance Mock Chart -->
 <div class="bg-white rounded-2xl p-8 border border-slate-200">
 <h3 class="text-lg text-slate-800 mb-6">Top Performing Sectors</h3>
 <div class="space-y-6">
 <div>
 <div class="flex justify-between text-sm mb-2">
 <span class="text-slate-700">Nigerian Police Force</span>
 <span class="text-slate-800">45%</span>
 </div>
 <div class="w-full bg-slate-100 rounded-full h-2.5">
 <div class="bg-emerald-500 h-2.5 rounded-full" style="width: 45%"></div>
 </div>
 </div>
 <div>
 <div class="flex justify-between text-sm mb-2">
 <span class="text-slate-700">Customs Service</span>
 <span class="text-slate-800">30%</span>
 </div>
 <div class="w-full bg-slate-100 rounded-full h-2.5">
 <div class="bg-blue-500 h-2.5 rounded-full" style="width: 30%"></div>
 </div>
 </div>
 <div>
 <div class="flex justify-between text-sm mb-2">
 <span class="text-slate-700">Federal Ministry of Health</span>
 <span class="text-slate-800">15%</span>
 </div>
 <div class="w-full bg-slate-100 rounded-full h-2.5">
 <div class="bg-amber-500 h-2.5 rounded-full" style="width: 15%"></div>
 </div>
 </div>
 <div>
 <div class="flex justify-between text-sm mb-2">
 <span class="text-slate-700">Other Ministries</span>
 <span class="text-slate-800">10%</span>
 </div>
 <div class="w-full bg-slate-100 rounded-full h-2.5">
 <div class="bg-slate-400 h-2.5 rounded-full" style="width: 10%"></div>
 </div>
 </div>
 </div>
 </div>

 <!-- Compliance Overview -->
 <div class="bg-white rounded-2xl p-8 border border-slate-200">
 <h3 class="text-lg text-slate-800 mb-6">Compliance & Onboarding Health</h3>
 
 <div class="grid grid-cols-2 gap-6">
 <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
 <div class="text-4xl text-emerald-600 mb-2">98.5%</div>
 <div class="text-sm text-slate-600">KYC Pass Rate</div>
 <p class="text-xs text-slate-400 mt-2">First-time BVN/NIN match</p>
 </div>
 
 <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
 <div class="text-4xl text-slate-800 mb-2">2.4%</div>
 <div class="text-sm text-slate-600">Abandonment Rate</div>
 <p class="text-xs text-slate-400 mt-2">During agent-assisted flow</p>
 </div>
 </div>

 <div class="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
 <svg class="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
 <div>
 <h4 class="text-sm text-amber-900">Attention Required</h4>
 <p class="text-xs text-amber-700 mt-1">15 agent applications have been pending Internal Control review for > 48 hours. Consider reassigning queue.</p>
 </div>
 </div>
 </div>
 </div>
 </div>
    </div>
</template>

<script setup>
import UiPulseLoader from '@/components/ui/PulseLoader.vue';
import { onMounted, ref } from 'vue';

const isLoading = ref(true);

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 800);
});

import { useMockData } from '@/composables/modules/useMockData';
import { useToast } from '@/composables/useToast';
import UiSelect from '@/components/ui/Select.vue';

definePageMeta({
 layout: 'dashboard'
});

const { analyticsStats } = useMockData();
const { addToast } = useToast();

const downloadReport = () => {
 addToast('Exporting CSV report for the selected period...', 'info');
 
 setTimeout(() => {
   const headers = ['Metric', 'Value'];
   const rows = [
     ['Total Applications', analyticsStats.totalApplications],
     ['Approval Rate', analyticsStats.approvalRate],
     ['Average Processing Time', analyticsStats.avgProcessingTime],
     ['Active Agents', analyticsStats.activeAgents]
   ];
   
   const csvContent = "data:text/csv;charset=utf-8," 
     + headers.join(",") + "\n"
     + rows.map(e => e.join(",")).join("\n");
     
   const encodedUri = encodeURI(csvContent);
   const link = document.createElement("a");
   link.setAttribute("href", encodedUri);
   link.setAttribute("download", `analytics_export_${new Date().toISOString().split('T')[0]}.csv`);
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);

   addToast('CSV export downloaded successfully.', 'success');
 }, 1000);
};
</script>
