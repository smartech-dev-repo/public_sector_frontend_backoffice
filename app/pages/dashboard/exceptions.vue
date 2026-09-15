<template>
 <div class="space-y-6">
 <div v-if="isLoading" class="py-20">
 <UiPulseLoader />
 </div>
 <div v-else class="space-y-6">
 <div>
 <p class="text-sm text-slate-500 mt-1">Manage and resolve cases flagged for manual intervention.</p>
 </div>

  <!-- Actions & Filters -->
  <div class="flex items-center justify-between gap-4">
    <div class="flex-1 max-w-md">
      <span class="text-sm text-slate-400">Showing {{ filteredExceptions.length }} of {{ exceptions.length }} exceptions</span>
    </div>
    
    <div class="flex items-center gap-3 relative">
      <button @click="showFilter = !showFilter" class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
        Filter
      </button>
      
      <!-- Filter Dropdown -->
      <div v-if="showFilter" class="absolute top-12 right-0 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50">
        <h3 class="text-sm font-semibold text-slate-900 mb-3">Filter Exceptions</h3>
        
        <div class="space-y-3 mb-4">
          <input v-model="filterParams.search" type="text" placeholder="Search by Reference ID..." class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500">
          
          <UiSelect 
            v-model="filterParams.team"
            placeholder="All Teams"
            :options="[{label: 'All Teams', value: ''}, {label: 'Risk & Compliance', value: 'Risk & Compliance'}, {label: 'Internal Control', value: 'Internal Control'}, {label: 'Operations', value: 'Operations'}]" 
          />
          
          <UiSelect 
            v-model="filterParams.status"
            placeholder="All Statuses"
            :options="[{label: 'All Statuses', value: ''}, {label: 'Open', value: 'Open'}, {label: 'Resolved', value: 'Resolved'}]" 
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

  <!-- Exception List -->
  <div class="space-y-4">
  <div v-if="filteredExceptions.length === 0" class="text-center py-8 text-slate-500 bg-white rounded-2xl border border-slate-200">
    No exceptions match your filter criteria.
  </div>
  <div v-for="exc in paginatedExceptions" :key="exc.id" class="bg-white rounded-2xl p-6 border border-slate-200 flex items-start justify-between group hover:border-emerald-300 transition-colors">
  <div class="flex items-start gap-4">
  <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" :class="{ 'bg-rose-100 text-rose-600': exc.severity === 'High', 'bg-amber-100 text-amber-600': exc.severity === 'Medium', 'bg-slate-100 text-slate-600': exc.severity === 'Low' }">
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
  </div>
  <div>
  <div class="flex items-center gap-3 mb-1">
  <h3 class="text-slate-800 text-lg">{{ exc.type }}</h3>
  <span class="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider whitespace-nowrap" :class="{ 'bg-rose-100 text-rose-700': exc.severity === 'High', 'bg-amber-100 text-amber-700': exc.severity === 'Medium', 'bg-slate-100 text-slate-700': exc.severity === 'Low' }">{{ exc.severity }}</span>
  <span class="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider whitespace-nowrap" :class="{ 'bg-emerald-100 text-emerald-700': exc.status === 'Resolved', 'bg-slate-100 text-slate-700': exc.status === 'Open' }">{{ exc.status }}</span>
  </div>
  <div class="text-sm text-slate-500 flex items-center gap-4">
  <span>Ref: <span class="font-mono text-slate-700">{{ exc.reference }}</span></span>
  <span>•</span>
  <span>Assigned: <span class="text-slate-700">{{ exc.assignedTo }}</span></span>
  <span>•</span>
  <span>{{ new Date(exc.date).toLocaleString() }}</span>
  </div>
  </div>
  </div>
  
  <div>
  <button v-if="exc.status === 'Open'" @click="resolveCase(exc)" class="bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors border border-emerald-200 hover:border-emerald-600">
  Resolve Case
  </button>
  <button v-else @click="viewDetails(exc)" class="text-slate-400 hover:text-emerald-600 text-sm transition-colors px-4 py-2">
  View Details
  </button>
  </div>
  </div>
  </div>

  <!-- Pagination -->
  <UiPagination 
    :total-items="filteredExceptions.length" 
    v-model:current-page="currentPage" 
    v-model:items-per-page="itemsPerPage" 
  />
  </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import UiPulseLoader from '@/components/ui/PulseLoader.vue';
import UiPagination from '@/components/ui/Pagination.vue';
import UiSelect from '@/components/ui/Select.vue';
import UiDatePicker from '@/components/ui/DatePicker.vue';
import { useMockData } from '@/composables/modules/useMockData';
import { useToast } from '@/composables/useToast';

definePageMeta({
  layout: 'dashboard'
});

const isLoading = ref(true);

onMounted(() => {
 setTimeout(() => {
 isLoading.value = false;
 }, 800);
});

const { exceptions } = useMockData();
const { addToast } = useToast();

const showFilter = ref(false);
const filterParams = ref({
  search: '',
  team: '',
  status: '',
  dateRange: ''
});

const clearFilters = () => {
  filterParams.value = { search: '', team: '', status: '', dateRange: '' };
};

const filteredExceptions = computed(() => {
  let result = exceptions.value;
  
  if (filterParams.value.search) {
    const lower = filterParams.value.search.toLowerCase();
    result = result.filter(exc => exc.reference.toLowerCase().includes(lower));
  }
  
  if (filterParams.value.team) {
    result = result.filter(exc => exc.assignedTo.includes(filterParams.value.team) || filterParams.value.team === ''); 
  }
  
  if (filterParams.value.status) {
    result = result.filter(exc => exc.status === filterParams.value.status);
  }
  
  if (filterParams.value.dateRange) {
    const dates = filterParams.value.dateRange.split(' to ');
    if (dates.length > 0) {
      const start = new Date(dates[0]).getTime();
      const end = dates.length === 2 ? new Date(dates[1]).getTime() : start;
      result = result.filter(exc => {
        const itemDate = new Date(exc.date).getTime();
        return itemDate >= start && itemDate <= end;
      });
    }
  }
  
  return result;
});

const currentPage = ref(1);
const itemsPerPage = ref(10);

const paginatedExceptions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredExceptions.value.slice(start, end);
});

const resolveCase = (exc) => {
 exc.status = 'Resolved';
 addToast(`Exception ${exc.reference} has been resolved successfully.`, 'success');
};

const viewDetails = (exc) => {
 addToast(`Viewing details for ${exc.reference}.`, 'info');
};
</script>
