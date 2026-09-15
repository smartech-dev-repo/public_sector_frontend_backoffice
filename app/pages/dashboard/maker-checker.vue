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
 
 <!-- Actions & Filters -->
 <div class="flex items-center justify-between gap-4 mb-4">
   <div class="flex-1 max-w-md">
     <span class="text-sm text-slate-400">Showing {{ filteredApplications.length }} of {{ agentApplicationsRef.length }} applications</span>
   </div>
   
   <div class="flex items-center gap-3 relative">
     <button @click="showFilter = !showFilter" class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
       <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
       Filter
     </button>
     
     <!-- Filter Dropdown -->
     <div v-if="showFilter" class="absolute top-12 right-0 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50">
       <h3 class="text-sm font-semibold text-slate-900 mb-3">Filter Applications</h3>
       
       <div class="space-y-3 mb-4">
         <input v-model="filterParams.search" type="text" placeholder="Search name or ref..." class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500">
         
         <UiSelect 
           v-model="filterParams.status"
           placeholder="All Statuses"
           :options="[{label: 'All Statuses', value: ''}, {label: 'Pending Review', value: 'Pending Review'}, {label: 'Approved', value: 'Approved'}, {label: 'Rejected', value: 'Rejected'}]" 
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
 <tr v-if="paginatedApplications.length === 0">
 <td colspan="5" class="px-6 py-8 text-center text-slate-500">No applications found.</td>
 </tr>
 <tr v-for="app in paginatedApplications" :key="app.id" class="hover:bg-slate-50/50 transition-colors">
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

 <!-- Pagination -->
 <UiPagination 
 :total-items="filteredApplications.length" 
 v-model:current-page="currentPage" 
 v-model:items-per-page="itemsPerPage" 
 />
 </div>
 </div>
</template>

<script setup>
import UiPulseLoader from '@/components/ui/PulseLoader.vue';
import { computed, onMounted, ref } from 'vue';
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
import UiTableDropdown from '@/components/ui/TableDropdown.vue';

definePageMeta({
 layout: 'dashboard'
});

const { agentApplications } = useMockData();

const agentApplicationsRef = ref(agentApplications);

const showFilter = ref(false);
const filterParams = ref({
  search: '',
  status: '',
  dateRange: ''
});

const clearFilters = () => {
  filterParams.value = { search: '', status: '', dateRange: '' };
};

const filteredApplications = computed(() => {
  let result = agentApplicationsRef.value;
  
  if (filterParams.value.search) {
    const lower = filterParams.value.search.toLowerCase();
    result = result.filter(app => 
      app.name.toLowerCase().includes(lower) || 
      app.id.toLowerCase().includes(lower)
    );
  }
  
  if (filterParams.value.status) {
    result = result.filter(app => app.status === filterParams.value.status);
  }
  
  if (filterParams.value.dateRange) {
    const dates = filterParams.value.dateRange.split(' to ');
    if (dates.length > 0) {
      const start = new Date(dates[0]).getTime();
      const end = dates.length === 2 ? new Date(dates[1]).getTime() : start;
      result = result.filter(app => {
        const itemDate = new Date(app.dateSubmitted).getTime();
        return itemDate >= start && itemDate <= end;
      });
    }
  }
  
  return result;
});

const currentPage = ref(1);
const itemsPerPage = ref(10);

const paginatedApplications = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredApplications.value.slice(start, end);
});

const pendingCount = computed(() => agentApplicationsRef.value.filter(a => a.status === 'Pending Review').length);
const approvedCount = computed(() => agentApplicationsRef.value.filter(a => a.status === 'Approved').length);
</script>
