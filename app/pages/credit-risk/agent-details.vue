<template>
  <div class="space-y-6 pb-12">
    <!-- Breadcrumb -->
    <div class="text-sm">
      <NuxtLink to="/credit-risk/agent-management" class="text-slate-400 hover:text-slate-600 transition-colors">Agent management</NuxtLink>
      <span class="text-slate-400 mx-2">/</span>
      <span class="text-slate-900 font-medium">Agent details</span>
    </div>

    <!-- Agent Details Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-2">
      <div>
        <p class="text-[12px] text-slate-400 mb-1">Name</p>
        <p class="text-[16px] font-semibold text-slate-900">Chukwuemeka Ibe</p>
      </div>
      <div>
        <p class="text-[12px] text-slate-400 mb-1">Phone</p>
        <p class="text-[16px] font-semibold text-slate-900">08031234821</p>
      </div>
      <div>
        <p class="text-[12px] text-slate-400 mb-1">Bvn</p>
        <p class="text-[16px] font-semibold text-slate-900">123456784821</p>
      </div>
      <div>
        <p class="text-[12px] text-slate-400 mb-1">Nin</p>
        <p class="text-[16px] font-semibold text-slate-900">1234567890</p>
      </div>
      <div>
        <p class="text-[12px] text-slate-400 mb-1">Gender</p>
        <p class="text-[16px] font-semibold text-slate-900">Male</p>
      </div>
      <div>
        <p class="text-[12px] text-slate-400 mb-1">Nationality</p>
        <p class="text-[16px] font-semibold text-slate-900">Nigerian</p>
      </div>
      <div class="md:col-span-2">
        <p class="text-[12px] text-slate-400 mb-1">Address</p>
        <p class="text-[16px] font-semibold text-slate-900">14 Adeniran Ogunsanya St, Surulere, Lagos</p>
        
        <!-- Assignee Tag -->
        <div class="mt-4 inline-flex items-center gap-3 bg-emerald-50/50 border border-emerald-100 rounded-xl p-2.5">
          <div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold">
            WA
          </div>
          <div class="flex flex-col pr-4">
            <span class="text-[13px] font-medium text-slate-900 leading-tight">Fawwaz Ali-Balogun</span>
            <span class="text-[10px] text-slate-500">f.bakare@moneyfield.ng &nbsp;&bull;&nbsp; 07012345678</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
      <div class="bg-slate-50 rounded-xl p-5 border border-slate-100">
        <h3 class="text-[13px] text-slate-500 font-medium mb-2">Agents pending full approval</h3>
        <div class="text-3xl font-bold text-emerald-600 mb-1">31</div>
      </div>
      <div class="bg-slate-50 rounded-xl p-5 border border-slate-100">
        <h3 class="text-[13px] text-slate-500 font-medium mb-2">Customers onboarded</h3>
        <div class="text-3xl font-bold text-emerald-600 mb-1">31</div>
      </div>
      <div class="bg-slate-50 rounded-xl p-5 border border-slate-100">
        <h3 class="text-[13px] text-slate-500 font-medium mb-2">Active agents</h3>
        <div class="text-3xl font-bold text-emerald-600 mb-1">31</div>
      </div>
    </div>

    <!-- Table Actions -->
    <div class="flex items-center justify-end gap-3 pt-4 relative">
      <span class="text-sm text-slate-400 mr-2">Showing {{ filteredLoans.length }} of {{ loansData.length }}</span>
      
      <!-- Filter Button -->
      <button @click="showFilter = !showFilter" class="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
        Filter
      </button>

      <!-- Filter Dropdown -->
      <div v-if="showFilter" class="absolute top-10 right-40 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50">
        <h3 class="text-sm font-semibold text-slate-900 mb-3">Filter Loans</h3>
        
        <div class="space-y-3 mb-4">
          <input v-model="filterParams.search" type="text" placeholder="Search by name or IPPIS..." class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500">
          
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
        Export as .xlsx
      </button>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mt-4">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-[#EAF5F0]">
            <tr>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Name</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">IPPIS NO.</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Agent</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Sector</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Loan Amt</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Date</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-if="filteredLoans.length === 0">
              <td colspan="7" class="px-6 py-8 text-center text-slate-500">No loans match your filter criteria.</td>
            </tr>
            <tr v-for="loan in paginatedLoans" :key="loan.id" class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-6 py-4 font-medium text-slate-900">{{ loan.name }}</td>
              <td class="px-6 py-4 text-slate-600">{{ loan.ippis }}</td>
              <td class="px-6 py-4 font-medium text-slate-900">{{ loan.agent }}</td>
              <td class="px-6 py-4 text-slate-600">{{ loan.sector }}</td>
              <td class="px-6 py-4 font-semibold text-slate-900">{{ loan.loanAmt }}</td>
              <td class="px-6 py-4 text-slate-600">{{ loan.date }}</td>
              <td class="px-6 py-4">
                <button class="font-medium text-slate-400 hover:text-emerald-600 transition-colors" title="View Details">
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
      :total-items="filteredLoans.length" 
      v-model:current-page="currentPage" 
      v-model:items-per-page="itemsPerPage" 
    />
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

const loansData = ref([
  { id: 1, name: 'Adaeze Nwosu', ippis: '23598720984', agent: 'Ibrahim Sani', sector: 'Fed. Min. Agric', loanAmt: '₦2,000,000', date: '16 Aug 2026' },
  { id: 2, name: 'Adaeze Nwosu', ippis: '23598720984', agent: 'Ibrahim Sani', sector: 'Fed. Min. Agric', loanAmt: '₦2,000,000', date: '16 Aug 2026' },
  { id: 3, name: 'Adaeze Nwosu', ippis: '23598720984', agent: 'Ibrahim Sani', sector: 'Fed. Min. Agric', loanAmt: '₦2,000,000', date: '16 Aug 2026' },
  { id: 4, name: 'Adaeze Nwosu', ippis: '23598720984', agent: 'Ibrahim Sani', sector: 'Fed. Min. Agric', loanAmt: '₦2,000,000', date: '16 Aug 2026' },
  { id: 5, name: 'Adaeze Nwosu', ippis: '23598720984', agent: 'Ibrahim Sani', sector: 'Fed. Min. Agric', loanAmt: '₦2,000,000', date: '16 Aug 2026' },
  { id: 6, name: 'Adaeze Nwosu', ippis: '23598720984', agent: 'Ibrahim Sani', sector: 'Fed. Min. Agric', loanAmt: '₦2,000,000', date: '16 Aug 2026' },
  { id: 7, name: 'Adaeze Nwosu', ippis: '23598720984', agent: 'Ibrahim Sani', sector: 'Fed. Min. Agric', loanAmt: '₦2,000,000', date: '16 Aug 2026' },
  { id: 8, name: 'Adaeze Nwosu', ippis: '23598720984', agent: 'Ibrahim Sani', sector: 'Fed. Min. Agric', loanAmt: '₦2,000,000', date: '16 Aug 2026' },
]);

const filteredLoans = computed(() => {
  let result = loansData.value;
  
  if (filterParams.value.search) {
    const lower = filterParams.value.search.toLowerCase();
    result = result.filter(loan => 
      loan.name.toLowerCase().includes(lower) || 
      loan.ippis.includes(lower) ||
      loan.sector.toLowerCase().includes(lower)
    );
  }
  
  if (filterParams.value.dateRange) {
    const dates = filterParams.value.dateRange.split(' to ');
    if (dates.length > 0) {
      const start = new Date(dates[0]).getTime();
      const end = dates.length === 2 ? new Date(dates[1]).getTime() : start;
      result = result.filter(loan => {
        const itemDate = new Date(loan.date).getTime();
        return itemDate >= start && itemDate <= end;
      });
    }
  }
  
  return result;
});

const currentPage = ref(1);
const itemsPerPage = ref(10);

const paginatedLoans = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredLoans.value.slice(start, end);
});
</script>
