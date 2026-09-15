<template>
 <div class="space-y-6">
 <div v-if="isLoading" class="py-20">
 <UiPulseLoader />
 </div>
 <div v-else class="space-y-6">
 <div class="flex justify-between items-end">
 <div>
 <p class="text-sm text-slate-500 mt-1">Monitor agent activity and enforce immediate suspension for flagged agents.</p>
 </div>
 </div>

 <!-- Alert -->
 <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
 <svg class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
 <div>
 <h4 class="text-sm text-amber-900">Immediate Access Revocation (SOP 10)</h4>
 <p class="text-xs text-amber-700 mt-1 leading-relaxed">Suspending an agent immediately terminates their active sessions and blocks new loan origination. This action is fully audited. Reactivation requires explicit Internal Control justification.</p>
 </div>
 </div>

 <!-- Filters -->
 <div class="flex items-center justify-between gap-4">
   <div class="flex-1 max-w-md">
     <span class="text-sm text-slate-400">Showing {{ filteredAgents.length }} of {{ agentList.length }} agents</span>
   </div>
   
   <div class="flex items-center gap-3 relative">
     <button @click="showFilter = !showFilter" class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
       <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
       Filter
     </button>
     
     <!-- Filter Dropdown -->
     <div v-if="showFilter" class="absolute top-12 right-0 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50">
       <h3 class="text-sm font-semibold text-slate-900 mb-3">Filter Agents</h3>
       
       <div class="space-y-3 mb-4">
         <input v-model="filterParams.search" type="text" placeholder="Search by Agent Name or ID..." class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500">
         
         <UiSelect 
           v-model="filterParams.status"
           placeholder="All Statuses"
           :options="[{label: 'All Statuses', value: ''}, {label: 'Active', value: 'Active'}, {label: 'Suspended', value: 'Suspended'}]" 
         />
         
         <UiDatePicker 
           v-model="filterParams.dateRange"
           placeholder="Select last active date"
         />
       </div>
       
       <div class="flex gap-2">
         <button @click="clearFilters" class="flex-1 py-2 bg-slate-50 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors">Clear</button>
         <button @click="showFilter = false" class="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">Apply Filter</button>
       </div>
     </div>
   </div>
 </div>

 <!-- Agent List -->
 <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
 <div class="overflow-x-auto">
 <table class="w-full text-sm text-left">
 <thead class="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
 <tr>
 <th scope="col" class="px-6 py-4 tracking-wider">Agent Details</th>
 <th scope="col" class="px-6 py-4 tracking-wider">Status</th>
 <th scope="col" class="px-6 py-4 tracking-wider">Total Originated</th>
 <th scope="col" class="px-6 py-4 tracking-wider">Last Active</th>
 <th scope="col" class="px-6 py-4 tracking-wider text-right">Action</th>
 </tr>
 </thead>
 <tbody class="divide-y divide-slate-100">
 <tr v-if="paginatedAgents.length === 0">
 <td colspan="5" class="px-6 py-8 text-center text-slate-500">No agents found.</td>
 </tr>
 <tr v-for="agent in paginatedAgents" :key="agent.id" class="hover:bg-slate-50/50 transition-colors">
 <td class="px-6 py-4">
 <div class="flex items-center gap-3">
 <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-medium">
 {{ agent.name.charAt(0) }}
 </div>
 <div>
 <div class="text-slate-800 font-medium">{{ agent.name }}</div>
 <div class="text-xs font-mono text-slate-500 mt-0.5">{{ agent.id }}</div>
 </div>
 </div>
 </td>
 <td class="px-6 py-4">
 <span class="px-2.5 py-1 rounded-md text-xs whitespace-nowrap" :class="{ 'bg-emerald-100 text-emerald-700': agent.status === 'Active', 'bg-rose-100 text-rose-700': agent.status === 'Suspended' }">
 {{ agent.status }}
 </span>
 </td>
 <td class="px-6 py-4 text-slate-800">
 {{ agent.originatedCount }}
 </td>
 <td class="px-6 py-4 text-slate-600">
 {{ new Date(agent.lastActive).toLocaleDateString() }}
 </td>
 <td class="px-6 py-4 text-right">
 <div class="flex justify-end">
 <UiTableDropdown>
 <button v-if="agent.status === 'Active'" @click="toggleStatus(agent)" class="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors">
 Suspend Agent
 </button>
 <button v-else @click="toggleStatus(agent)" class="w-full text-left px-4 py-2.5 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors">
 Reactivate Agent
 </button>
 <button @click="previewAgent(agent)" class="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
 Preview Details
 </button>
 <button class="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
 View Audit Logs
 </button>
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
 :total-items="filteredAgents.length" 
 v-model:current-page="currentPage" 
 v-model:items-per-page="itemsPerPage" 
 />

 <!-- Suspension Modal -->
 <UiModal v-model="showActionModal" :title="`Confirm ${pendingAction === 'suspend' ? 'Suspension' : 'Reactivation'}`" @confirm="executeAction">
 Are you sure you want to {{ pendingAction }} <strong>{{ pendingAgent?.name }}</strong>? This action will be immutably recorded in the audit trail.
 </UiModal>

 <!-- Preview Modal -->
 <UiModal v-model="showPreviewModal" title="Agent Overview" @confirm="showPreviewModal = false">
 <div v-if="previewData" class="space-y-4 text-sm">
 <div class="flex items-center gap-4 border-b border-slate-100 pb-4">
 <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-medium">
 {{ previewData.name.charAt(0) }}
 </div>
 <div>
 <h3 class="font-medium text-slate-800 text-lg">{{ previewData.name }}</h3>
 <p class="text-slate-500 font-mono">{{ previewData.id }}</p>
 </div>
 </div>
 <div class="grid grid-cols-2 gap-4 pt-2">
 <div>
 <p class="text-slate-400 text-xs uppercase tracking-wider">Status</p>
 <p class="font-medium mt-1" :class="previewData.status === 'Active' ? 'text-emerald-600' : 'text-rose-600'">{{ previewData.status }}</p>
 </div>
 <div>
 <p class="text-slate-400 text-xs uppercase tracking-wider">Total Originated</p>
 <p class="font-medium text-slate-800 mt-1">{{ previewData.originatedCount }}</p>
 </div>
 <div>
 <p class="text-slate-400 text-xs uppercase tracking-wider">Last Active</p>
 <p class="font-medium text-slate-800 mt-1">{{ new Date(previewData.lastActive).toLocaleDateString() }}</p>
 </div>
 </div>
 </div>
 <template #footer>
 <div class="w-full flex justify-end">
 <button @click="showPreviewModal = false" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition-colors">
 Close
 </button>
 </div>
 </template>
 </UiModal>
 </div>
 </div>
</template>

<script setup>
import UiPulseLoader from '@/components/ui/PulseLoader.vue';
import { onMounted, ref, computed } from 'vue';
import UiPagination from '@/components/ui/Pagination.vue';

const isLoading = ref(true);

onMounted(() => {
 setTimeout(() => {
 isLoading.value = false;
 }, 800);
});

import { useToast } from '@/composables/useToast';
import UiModal from '@/components/ui/Modal.vue';
import UiSelect from '@/components/ui/Select.vue';
import UiTableDropdown from '@/components/ui/TableDropdown.vue';
import UiDatePicker from '@/components/ui/DatePicker.vue';

definePageMeta({
 layout: 'dashboard'
});

const { addToast } = useToast();
const showActionModal = ref(false);
const showPreviewModal = ref(false);
const pendingAgent = ref(null);
const previewData = ref(null);
const pendingAction = ref('');

const agentList = ref([
 { id: 'AGT-3042', name: 'Mercy Johnson', status: 'Active', originatedCount: 89, lastActive: '2026-09-14T08:30:00Z' },
 { id: 'AGT-3045', name: 'Solomon Peter', status: 'Active', originatedCount: 12, lastActive: '2026-09-13T14:20:00Z' },
 { id: 'AGT-3011', name: 'Grace Adeleke', status: 'Suspended', originatedCount: 45, lastActive: '2026-09-10T09:15:00Z' }
]);

const showFilter = ref(false);
const filterParams = ref({
  search: '',
  status: '',
  dateRange: ''
});

const clearFilters = () => {
  filterParams.value = { search: '', status: '', dateRange: '' };
};

const filteredAgents = computed(() => {
  let result = agentList.value;
  
  if (filterParams.value.search) {
    const lower = filterParams.value.search.toLowerCase();
    result = result.filter(a => a.name.toLowerCase().includes(lower) || a.id.toLowerCase().includes(lower));
  }
  
  if (filterParams.value.status) {
    result = result.filter(a => a.status === filterParams.value.status);
  }
  
  if (filterParams.value.dateRange) {
    const dates = filterParams.value.dateRange.split(' to ');
    if (dates.length > 0) {
      const start = new Date(dates[0]).getTime();
      const end = dates.length === 2 ? new Date(dates[1]).getTime() : start;
      result = result.filter(a => {
        const itemDate = new Date(a.lastActive).getTime();
        return itemDate >= start && itemDate <= end;
      });
    }
  }
  
  return result;
});

const currentPage = ref(1);
const itemsPerPage = ref(10);

const paginatedAgents = computed(() => {
 const start = (currentPage.value - 1) * itemsPerPage.value;
 const end = start + itemsPerPage.value;
 return filteredAgents.value.slice(start, end);
});

const toggleStatus = (agent) => {
 pendingAgent.value = agent;
 pendingAction.value = agent.status === 'Active' ? 'suspend' : 'reactivate';
 showActionModal.value = true;
};

const executeAction = () => {
 if (pendingAgent.value) {
 const isSuspending = pendingAgent.value.status === 'Active';
 pendingAgent.value.status = isSuspending ? 'Suspended' : 'Active';
 addToast(`Agent successfully ${isSuspending ? 'suspended' : 'reactivated'}.`, isSuspending ? 'warning' : 'success');
 }
 showActionModal.value = false;
 pendingAgent.value = null;
};

const previewAgent = (agent) => {
 previewData.value = agent;
 showPreviewModal.value = true;
};
</script>
