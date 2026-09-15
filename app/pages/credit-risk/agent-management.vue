<template>
  <div class="space-y-6">
    <!-- Actions -->
    <div class="flex items-center justify-end gap-3 relative">
      <span class="text-sm text-slate-400 mr-2">Showing {{ filteredAgents.length }} of {{ agentsData.length }} agents</span>
      
      <!-- Filter Button -->
      <button @click="showFilter = !showFilter" class="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
        Filter
      </button>

      <!-- Filter Dropdown -->
      <div v-if="showFilter" class="absolute top-10 right-40 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50">
        <h3 class="text-sm font-semibold text-slate-900 mb-3">Filter Agents</h3>
        
        <div class="space-y-3 mb-4">
          <input v-model="filterParams.search" type="text" placeholder="Search by name, NIN or linked agent..." class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500">
          
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

      <button class="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        Export as Excel (.xlsx)
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-slate-50 rounded-xl p-5 border border-slate-100">
        <h3 class="text-[13px] text-slate-500 font-medium mb-2">Agents pending full approval</h3>
        <div class="text-3xl font-bold text-emerald-600 mb-1">31</div>
        <p class="text-[11px] text-slate-400">needs PS Lead + IC</p>
      </div>
      <div class="bg-slate-50 rounded-xl p-5 border border-slate-100">
        <h3 class="text-[13px] text-slate-500 font-medium mb-2">Customers onboarded</h3>
        <div class="text-3xl font-bold text-emerald-600 mb-1">31</div>
        <p class="text-[11px] text-slate-400">this month</p>
      </div>
      <div class="bg-slate-50 rounded-xl p-5 border border-slate-100">
        <h3 class="text-[13px] text-slate-500 font-medium mb-2">Active agents</h3>
        <div class="text-3xl font-bold text-emerald-600 mb-1">31</div>
        <p class="text-[11px] text-slate-400">in Public Sector network</p>
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-[#EAF5F0]">
            <tr>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Name</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">NIN</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Address</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Date</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Linked To</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-if="filteredAgents.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-slate-500">No agents match your filter criteria.</td>
            </tr>
            <tr v-for="agent in paginatedAgents" :key="agent.id" class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-6 py-4 font-medium text-slate-900">{{ agent.name }}</td>
              <td class="px-6 py-4 text-slate-600">{{ agent.nin }}</td>
              <td class="px-6 py-4 text-slate-600">{{ agent.address }}</td>
              <td class="px-6 py-4 text-slate-600">{{ agent.date }}</td>
              <td class="px-6 py-4 text-slate-900 font-medium">{{ agent.linkedTo }}</td>
              <td class="px-6 py-4">
                <button @click="openModal(agent)" class="font-medium text-slate-400 hover:text-emerald-600 transition-colors" title="View Details">
                  <Eye class="w-5 h-5" />
                </button>
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

    <!-- Agent Details Modal -->
    <UiModal v-model="isModalOpen" title="Agent Details">
      <div v-if="selectedAgent" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <span class="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">Name</span>
            <span class="text-sm text-slate-900 font-medium">{{ selectedAgent.name }}</span>
          </div>
          <div>
            <span class="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">NIN</span>
            <span class="text-sm text-slate-900">{{ selectedAgent.nin }}</span>
          </div>
          <div class="col-span-2">
            <span class="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">Address</span>
            <span class="text-sm text-slate-900">{{ selectedAgent.address }}</span>
          </div>
          <div>
            <span class="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">Date Onboarded</span>
            <span class="text-sm text-slate-900">{{ selectedAgent.date }}</span>
          </div>
          <div>
            <span class="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">Linked To</span>
            <span class="text-sm text-slate-900">{{ selectedAgent.linkedTo }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <button @click="isModalOpen = false" class="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors rounded-lg text-sm font-medium">Close</button>
      </template>
    </UiModal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Eye } from 'lucide-vue-next';
import UiModal from '@/components/ui/Modal.vue';
import UiPagination from '@/components/ui/Pagination.vue';
import UiDatePicker from '@/components/ui/DatePicker.vue';

definePageMeta({
  layout: 'credit-risk'
});

const showFilter = ref(false);
const filterParams = ref({
  search: '',
  dateRange: ''
});

const clearFilters = () => {
  filterParams.value = { search: '', dateRange: '' };
};

const agentsData = ref([
  { id: 1, name: 'Adaeze Nwosu', nin: '23598720984', address: '9 Chime Ave, .......... Layout, Enugu', date: '16 Aug 2026', linkedTo: 'Tunde Bakare' },
  { id: 2, name: 'Adaeze Nwosu', nin: '23598720984', address: '9 Chime Ave, .......... Layout, Enugu', date: '16 Aug 2026', linkedTo: 'Tunde Bakare' },
  { id: 3, name: 'Adaeze Nwosu', nin: '23598720984', address: '9 Chime Ave, .......... Layout, Enugu', date: '16 Aug 2026', linkedTo: 'Tunde Bakare' },
  { id: 4, name: 'Adaeze Nwosu', nin: '23598720984', address: '9 Chime Ave, .......... Layout, Enugu', date: '16 Aug 2026', linkedTo: 'Tunde Bakare' },
  { id: 5, name: 'Adaeze Nwosu', nin: '23598720984', address: '9 Chime Ave, .......... Layout, Enugu', date: '16 Aug 2026', linkedTo: 'Tunde Bakare' },
  { id: 6, name: 'Adaeze Nwosu', nin: '23598720984', address: '9 Chime Ave, .......... Layout, Enugu', date: '16 Aug 2026', linkedTo: 'Tunde Bakare' },
  { id: 7, name: 'Adaeze Nwosu', nin: '23598720984', address: '9 Chime Ave, .......... Layout, Enugu', date: '16 Aug 2026', linkedTo: 'Tunde Bakare' },
  { id: 8, name: 'Adaeze Nwosu', nin: '23598720984', address: '9 Chime Ave, .......... Layout, Enugu', date: '16 Aug 2026', linkedTo: 'Tunde Bakare' },
]);

const filteredAgents = computed(() => {
  let result = agentsData.value;
  
  if (filterParams.value.search) {
    const lower = filterParams.value.search.toLowerCase();
    result = result.filter(agent => 
      agent.name.toLowerCase().includes(lower) || 
      agent.nin.includes(lower) ||
      agent.linkedTo.toLowerCase().includes(lower)
    );
  }
  
  if (filterParams.value.dateRange) {
    const dates = filterParams.value.dateRange.split(' to ');
    if (dates.length > 0) {
      const start = new Date(dates[0]).getTime();
      const end = dates.length === 2 ? new Date(dates[1]).getTime() : start;
      result = result.filter(agent => {
        const itemDate = new Date(agent.date).getTime();
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

const isModalOpen = ref(false);
const selectedAgent = ref(null);

const openModal = (agent) => {
  selectedAgent.value = agent;
  isModalOpen.value = true;
};
</script>
