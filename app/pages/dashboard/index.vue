<template>
 <div class="space-y-6">
 <div v-if="isLoading" class="py-20">
 <UiPulseLoader />
 </div>
 <div v-else class="space-y-6">
 <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
 <div>
 <h2 class="text-2xl font-medium text-slate-800">Welcome back, {{ adminProfile.name.split(' ')[0] }}</h2>
 <p class="text-sm text-slate-500 mt-1">Here is what is happening across the Public Sector Lending Platform today.</p>
 </div>
 <div class="flex flex-wrap items-center gap-3">
 <NuxtLink to="/dashboard/maker-checker" class="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors border border-emerald-200">
 Review Queue
 </NuxtLink>
 <button @click="generateReport" class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
 Generate Report
 </button>
 </div>
 </div>

 <!-- High-level KPIs -->
 <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 <div class="bg-white rounded-2xl p-6 border border-slate-200">
 <div class="text-xs text-slate-500 uppercase tracking-wider mb-2">Total Loans Originated</div>
 <div class="text-3xl font-medium text-slate-800">{{ analyticsStats.totalLoansOriginated.toLocaleString() }}</div>
 <div class="text-sm text-emerald-600 mt-2 font-medium flex items-center gap-1">
 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
 +14% this month
 </div>
 </div>
 <div class="bg-white rounded-2xl p-6 border border-slate-200">
 <div class="text-xs text-slate-500 uppercase tracking-wider mb-2">Total Volume Disbursed</div>
 <div class="text-3xl font-medium text-slate-800">₦{{ (analyticsStats.totalVolume / 1000000).toFixed(1) }}M</div>
 <div class="text-sm text-emerald-600 mt-2 font-medium flex items-center gap-1">
 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
 +8.2% this month
 </div>
 </div>
 <div class="bg-white rounded-2xl p-6 border border-slate-200">
 <div class="text-xs text-slate-500 uppercase tracking-wider mb-2">Pending Applications</div>
 <div class="text-3xl font-medium text-amber-600">{{ pendingApps }}</div>
 <div class="text-sm text-amber-600 mt-2 font-medium flex items-center gap-1">
 Requires Review
 </div>
 </div>
 <div class="bg-white rounded-2xl p-6 border border-slate-200">
 <div class="text-xs text-slate-500 uppercase tracking-wider mb-2">Open Exceptions</div>
 <div class="text-3xl font-medium text-rose-600">{{ openExceptions }}</div>
 <div class="text-sm text-rose-600 mt-2 font-medium flex items-center gap-1">
 Action Required
 </div>
 </div>
 </div>

 <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
 <!-- Quick Actions -->
 <div class="bg-white rounded-2xl p-6 border border-slate-200">
 <h3 class="text-lg font-medium text-slate-800 mb-4">Quick Actions</h3>
 <div class="space-y-3">
 <NuxtLink to="/dashboard/maker-checker" class="block p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors group">
 <div class="font-medium text-slate-700 group-hover:text-emerald-700">Review Applications</div>
 <div class="text-sm text-slate-500 mt-1">Process pending agent and officer requests</div>
 </NuxtLink>
 <NuxtLink to="/dashboard/team" class="block p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors group">
 <div class="font-medium text-slate-700 group-hover:text-emerald-700">Manage Team</div>
 <div class="text-sm text-slate-500 mt-1">Add officers or adjust performance targets</div>
 </NuxtLink>
 <NuxtLink to="/dashboard/exceptions" class="block p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors group">
 <div class="font-medium text-slate-700 group-hover:text-emerald-700">Resolve Exceptions</div>
 <div class="text-sm text-slate-500 mt-1">Clear compliance and operational blocks</div>
 </NuxtLink>
 </div>
 </div>

 <!-- Recent Activity Feed -->
 <div class="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200">
 <h3 class="text-lg font-medium text-slate-800 mb-6">Recent Activity</h3>
 <div class="space-y-6">
 <div v-for="log in auditLogs.slice(0, 4)" :key="log.id" class="flex gap-4">
 <div class="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-500">
 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
 </div>
 <div>
 <div class="text-slate-800">
 <span class="font-medium">{{ log.actor }}</span> performed <span class="font-medium">{{ log.action }}</span> on <span class="font-medium">{{ log.target }}</span>
 </div>
 <div class="text-sm text-slate-500 mt-1 flex items-center gap-2">
 <span>{{ new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</span>
 <span>•</span>
 <span>{{ log.reason }}</span>
 </div>
 </div>
 </div>
 </div>
 <div class="mt-6 pt-4 border-t border-slate-100">
 <NuxtLink to="/dashboard/audit" class="text-sm font-medium text-emerald-600 hover:text-emerald-700">View all activity &rarr;</NuxtLink>
 </div>
 </div>
 </div>
 </div>
 </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import UiPulseLoader from '@/components/ui/PulseLoader.vue';
import { useMockData } from '@/composables/modules/useMockData';
import { useToast } from '@/composables/useToast';

const isLoading = ref(true);

onMounted(() => {
 setTimeout(() => {
 isLoading.value = false;
 }, 800);
});

definePageMeta({
 layout: 'dashboard'
});

const { adminProfile, analyticsStats, agentApplications, exceptions, auditLogs } = useMockData();
const { addToast } = useToast();

const pendingApps = computed(() => agentApplications.filter(a => a.status === 'Pending Review').length);
const openExceptions = computed(() => exceptions.filter(e => e.status === 'Open').length);

const generateReport = () => {
 addToast('Generating platform report...', 'success');
 
 // Actually generate and download a CSV file
 setTimeout(() => {
 const headers = ['Metric', 'Value'];
 const rows = [
 ['Total Loans Originated', analyticsStats.totalLoansOriginated],
 ['Total Volume Disbursed', `₦${(analyticsStats.totalVolume / 1000000).toFixed(1)}M`],
 ['Pending Applications', pendingApps.value],
 ['Open Exceptions', openExceptions.value]
 ];
 
 const csvContent = "data:text/csv;charset=utf-8," 
 + headers.join(",") + "\n"
 + rows.map(e => e.join(",")).join("\n");
 
 const encodedUri = encodeURI(csvContent);
 const link = document.createElement("a");
 link.setAttribute("href", encodedUri);
 link.setAttribute("download", `platform_report_${new Date().toISOString().split('T')[0]}.csv`);
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);

 addToast('Report generated and downloaded successfully.', 'success');
 }, 1000);
};
</script>
