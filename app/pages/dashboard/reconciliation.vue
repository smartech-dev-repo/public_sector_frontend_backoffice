<template>
 <div class="space-y-6">
 <div v-if="isLoading" class="py-20">
 <UiPulseLoader />
 </div>
 <div v-else class="space-y-6">
 <div class="flex justify-between items-end">
 <div>
 <p class="text-sm text-slate-500 mt-1">Match approved portal loans against CBA disbursement records.</p>
 </div>
 <button @click="uploadExtract" class="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2">
 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
 Upload CBA Extract
 </button>
 </div>

 <!-- KPI Cards -->
 <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
 <div class="bg-white rounded-2xl p-5 border border-slate-200">
 <div class="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Records</div>
 <div class="text-2xl text-slate-800">{{ reconciliationRecords.length }}</div>
 </div>
 <div class="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
 <div class="text-xs text-emerald-600 uppercase tracking-wider mb-1">Matched</div>
 <div class="text-2xl text-emerald-700">{{ reconciliationRecords.filter(r => r.matchStatus === 'Matched').length }}</div>
 </div>
 <div class="bg-rose-50 rounded-2xl p-5 border border-rose-100">
 <div class="text-xs text-rose-600 uppercase tracking-wider mb-1">Unmatched</div>
 <div class="text-2xl text-rose-700">{{ reconciliationRecords.filter(r => r.matchStatus === 'Unmatched').length }}</div>
 </div>
 <div class="bg-amber-50 rounded-2xl p-5 border border-amber-100">
 <div class="text-xs text-amber-600 uppercase tracking-wider mb-1">Reversed</div>
 <div class="text-2xl text-amber-700">{{ reconciliationRecords.filter(r => r.matchStatus === 'Reversed').length }}</div>
 </div>
 </div>

 <!-- Data Table -->
 <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden mt-6">
 <div class="overflow-x-auto">
 <table class="w-full text-left border-collapse">
 <thead>
 <tr class="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 ">
 <th class="px-6 py-4">Ref ID</th>
 <th class="px-6 py-4">Customer</th>
 <th class="px-6 py-4">Amount</th>
 <th class="px-6 py-4">Portal Status</th>
 <th class="px-6 py-4">CBA Status</th>
 <th class="px-6 py-4 text-center">Match Status</th>
 <th class="px-6 py-4 text-right">Action</th>
 </tr>
 </thead>
 <tbody class="divide-y divide-slate-100 text-sm">
 <tr v-for="record in reconciliationRecords" :key="record.id" class="hover:bg-slate-50/50 transition-colors group">
 <td class="px-6 py-4 font-mono text-slate-600">{{ record.loanId }}</td>
 <td class="px-6 py-4 font-medium text-slate-800">{{ record.customer }}</td>
 <td class="px-6 py-4 text-slate-600">₦{{ record.amount.toLocaleString() }}</td>
 <td class="px-6 py-4">
 <span class="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700 whitespace-nowrap">{{ record.portalStatus }}</span>
 </td>
 <td class="px-6 py-4">
 <span class="px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap" :class="{ 'bg-emerald-100 text-emerald-700': record.cbaStatus === 'Disbursed', 'bg-slate-100 text-slate-700': record.cbaStatus === 'Pending', 'bg-rose-100 text-rose-700': record.cbaStatus === 'Reversed' }">{{ record.cbaStatus }}</span>
 </td>
 <td class="px-6 py-4">
 <div class="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs border whitespace-nowrap" :class="{ 'bg-emerald-50 border-emerald-200 text-emerald-700': record.matchStatus === 'Matched', 'bg-rose-50 border-rose-200 text-rose-700': record.matchStatus === 'Unmatched', 'bg-amber-50 border-amber-200 text-amber-700': record.matchStatus === 'Reversed' }">
 <span v-if="record.matchStatus === 'Matched'">✓</span>
 <span v-if="record.matchStatus === 'Unmatched'">!</span>
 {{ record.matchStatus }}
 </div>
 </td>
 <td class="px-6 py-4 text-right">
 <div class="flex justify-end">
 <UiTableDropdown v-if="record.matchStatus !== 'Matched'">
 <button @click="resolveRecord(record)" class="w-full text-left px-4 py-2.5 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors">
 Resolve Record
 </button>
 </UiTableDropdown>
 <span v-else class="text-slate-300">-</span>
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
import { onMounted, ref } from 'vue';

const isLoading = ref(true);

onMounted(() => {
 setTimeout(() => {
 isLoading.value = false;
 }, 800);
});

import { useMockData } from '@/composables/modules/useMockData';
import { useToast } from '@/composables/useToast';
import UiTableDropdown from '@/components/ui/TableDropdown.vue';

definePageMeta({
 layout: 'dashboard'
});

const { reconciliationRecords } = useMockData();
const { addToast } = useToast();

const uploadExtract = () => {
 addToast('Uploading CBA extract. Please wait...', 'info');
 setTimeout(() => {
 addToast('CBA extract successfully uploaded and processed.', 'success');
 }, 1500);
};

const resolveRecord = (record) => {
 record.matchStatus = 'Matched';
 addToast(`Record ${record.loanId} resolved manually.`, 'success');
};
</script>
