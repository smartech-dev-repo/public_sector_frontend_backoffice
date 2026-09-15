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
 
 <!-- Actions & Filters -->
 <div class="flex items-center justify-between gap-4 mb-4">
   <div class="flex-1 max-w-md">
     <span class="text-sm text-slate-400">Showing {{ filteredRecords.length }} of {{ reconciliationRecordsRef.length }} records</span>
   </div>
   
   <div class="flex items-center gap-3 relative">
     <button @click="showFilter = !showFilter" class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
       <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
       Filter
     </button>
     
     <!-- Filter Dropdown -->
     <div v-if="showFilter" class="absolute top-12 right-0 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50">
       <h3 class="text-sm font-semibold text-slate-900 mb-3">Filter Records</h3>
       
       <div class="space-y-3 mb-4">
         <input v-model="filterParams.search" type="text" placeholder="Search customer or ref..." class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500">
         
         <UiSelect 
           v-model="filterParams.matchStatus"
           placeholder="All Match Statuses"
           :options="[{label: 'All Match Statuses', value: ''}, {label: 'Matched', value: 'Matched'}, {label: 'Unmatched', value: 'Unmatched'}, {label: 'Reversed', value: 'Reversed'}]" 
         />
         
         <UiDatePicker 
           v-model="filterParams.dateRange"
           placeholder="Select date range"
         />
       </div>
       
       <div class="flex gap-2">
         <button @click="clearFilters" class="flex-1 py-2 bg-slate-50 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors">Clear</button>
         <button @click="showFilter = false" class="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">Apply Filter</button>
       </div>
     </div>
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
 <tr v-if="paginatedRecords.length === 0">
 <td colspan="7" class="px-6 py-8 text-center text-slate-500">No records found.</td>
 </tr>
 <tr v-for="record in paginatedRecords" :key="record.id" class="hover:bg-slate-50/50 transition-colors group">
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

 <!-- Pagination -->
 <UiPagination 
 :total-items="filteredRecords.length" 
 v-model:current-page="currentPage" 
 v-model:items-per-page="itemsPerPage" 
 />
 </div>
 </div>
</template>

<script setup>
import UiPulseLoader from '@/components/ui/PulseLoader.vue';
import { onMounted, ref, computed } from 'vue';
import UiPagination from '@/components/ui/Pagination.vue';
import UiSelect from '@/components/ui/Select.vue';
import UiDatePicker from '@/components/ui/DatePicker.vue';

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

const reconciliationRecordsRef = ref(reconciliationRecords);

const showFilter = ref(false);
const filterParams = ref({
  search: '',
  matchStatus: '',
  dateRange: ''
});

const clearFilters = () => {
  filterParams.value = { search: '', matchStatus: '', dateRange: '' };
};

const filteredRecords = computed(() => {
  let result = reconciliationRecordsRef.value;
  
  if (filterParams.value.search) {
    const lower = filterParams.value.search.toLowerCase();
    result = result.filter(r => 
      r.customer.toLowerCase().includes(lower) || 
      r.loanId.toLowerCase().includes(lower)
    );
  }
  
  if (filterParams.value.matchStatus) {
    result = result.filter(r => r.matchStatus === filterParams.value.matchStatus);
  }
  
  if (filterParams.value.dateRange) {
    const dates = filterParams.value.dateRange.split(' to ');
    if (dates.length > 0) {
      const start = new Date(dates[0]).getTime();
      const end = dates.length === 2 ? new Date(dates[1]).getTime() : start;
      result = result.filter(r => {
        if (!r.date) return true; // fallback if date doesn't exist
        const itemDate = new Date(r.date).getTime();
        return itemDate >= start && itemDate <= end;
      });
    }
  }
  
  return result;
});

const currentPage = ref(1);
const itemsPerPage = ref(10);

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredRecords.value.slice(start, end);
});

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
