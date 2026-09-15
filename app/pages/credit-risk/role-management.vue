<template>
  <div class="space-y-6 relative h-full">
    <!-- Actions -->
    <div class="flex items-center justify-end gap-3 relative">
      <span class="text-sm text-slate-400 mr-2">Showing {{ filteredRoles.length }} of {{ rolesData.length }}</span>
      
      <!-- Filter Button -->
      <button @click="showFilter = !showFilter" class="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
        Filter
      </button>

      <!-- Filter Dropdown -->
      <div v-if="showFilter" class="absolute top-10 right-40 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50">
        <h3 class="text-sm font-semibold text-slate-900 mb-3">Filter Roles</h3>
        
        <div class="space-y-3 mb-4">
          <input v-model="filterParams.search" type="text" placeholder="Search name or role..." class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500">
          
          <UiSelect 
            v-model="filterParams.department"
            placeholder="All Departments"
            :options="[{label: 'All Departments', value: ''}, {label: 'Credit and Risk', value: 'Credit and Risk'}, {label: 'Public Sector', value: 'Public Sector'}]" 
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

      <button @click="openModal" class="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 rounded-lg text-sm font-medium text-white hover:bg-emerald-700 transition-colors shadow-sm ml-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        Invite Member
      </button>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-[#EAF5F0]">
            <tr>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Name</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Department</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Email</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Date</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Role</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-if="filteredRoles.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-slate-500">No roles match your filter criteria.</td>
            </tr>
            <tr v-for="role in paginatedRoles" :key="role.id" class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-6 py-4 font-medium text-slate-900">{{ role.name }}</td>
              <td class="px-6 py-4 text-slate-600">{{ role.department }}</td>
              <td class="px-6 py-4 text-slate-600">{{ role.email }}</td>
              <td class="px-6 py-4 text-slate-600">{{ role.date }}</td>
              <td class="px-6 py-4 text-slate-900 font-medium">{{ role.role }}</td>
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
      :total-items="filteredRoles.length" 
      v-model:current-page="currentPage" 
      v-model:items-per-page="itemsPerPage" 
    />

    <!-- Invite Modal -->
    <Teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="closeModal"></div>
      
      <div class="relative bg-white rounded-3xl shadow-xl w-full max-w-[440px] flex flex-col">
        <div class="p-8">
          <h2 class="text-xl font-semibold text-slate-900 mb-6">Invite Member</h2>
          
          <div class="space-y-4">
            <AuthInput label="Email" modelValue="w.uzoor@moneyfieldmfb.com" />
            
            <div class="flex flex-col gap-1.5">
              <label class="text-[12px] font-medium text-slate-500 ml-1">Role</label>
              <div class="relative">
                <select class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm appearance-none cursor-pointer">
                  <option value="" disabled selected>select</option>
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                </select>
                <!-- Custom chevron -->
                <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Modal Actions -->
          <div class="flex gap-4 pt-6 mt-2">
            <button @click="closeModal" class="px-6 py-3 rounded-xl border border-emerald-500 text-emerald-600 font-medium hover:bg-emerald-50 transition-colors shrink-0">
              Cancel
            </button>
            <button @click="closeModal" class="flex-1 py-3 px-6 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors">
              Proceed
            </button>
          </div>
        </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Eye } from 'lucide-vue-next';
import UiPagination from '@/components/ui/Pagination.vue';
import UiSelect from '@/components/ui/Select.vue';
import UiDatePicker from '@/components/ui/DatePicker.vue';

definePageMeta({
  layout: 'credit-risk'
});

const isModalOpen = ref(false);
const showFilter = ref(false);
const filterParams = ref({
  search: '',
  department: '',
  dateRange: ''
});

const clearFilters = () => {
  filterParams.value = { search: '', department: '', dateRange: '' };
};

const rolesData = ref([
  { id: 1, name: 'Adaeze Nwosu', department: 'Credit and Risk', email: 'a.nwosu@moneyfieldmfb.com', date: '16 Aug 2026', role: 'Credit Risk' },
  { id: 2, name: 'Adaeze Nwosu', department: 'Public Sector', email: 'a.nwosu@moneyfieldmfb.com', date: '16 Aug 2026', role: 'Back Office' },
  { id: 3, name: 'Adaeze Nwosu', department: 'Credit and Risk', email: 'a.nwosu@moneyfieldmfb.com', date: '16 Aug 2026', role: 'Credit Risk' },
  { id: 4, name: 'Adaeze Nwosu', department: 'Credit and Risk', email: 'a.nwosu@moneyfieldmfb.com', date: '16 Aug 2026', role: 'Credit Risk' },
  { id: 5, name: 'Adaeze Nwosu', department: 'Credit and Risk', email: 'a.nwosu@moneyfieldmfb.com', date: '16 Aug 2026', role: 'Credit Risk' },
  { id: 6, name: 'Adaeze Nwosu', department: 'Credit and Risk', email: 'a.nwosu@moneyfieldmfb.com', date: '16 Aug 2026', role: 'Credit Risk' },
  { id: 7, name: 'Adaeze Nwosu', department: 'Credit and Risk', email: 'a.nwosu@moneyfieldmfb.com', date: '16 Aug 2026', role: 'Credit Risk' },
  { id: 8, name: 'Adaeze Nwosu', department: 'Credit and Risk', email: 'a.nwosu@moneyfieldmfb.com', date: '16 Aug 2026', role: 'Credit Risk' },
]);

const filteredRoles = computed(() => {
  let result = rolesData.value;
  
  if (filterParams.value.search) {
    const lower = filterParams.value.search.toLowerCase();
    result = result.filter(r => 
      r.name.toLowerCase().includes(lower) || 
      r.role.toLowerCase().includes(lower) ||
      r.email.toLowerCase().includes(lower)
    );
  }
  
  if (filterParams.value.department) {
    result = result.filter(r => r.department === filterParams.value.department);
  }
  
  if (filterParams.value.dateRange) {
    const dates = filterParams.value.dateRange.split(' to ');
    if (dates.length > 0) {
      const start = new Date(dates[0]).getTime();
      const end = dates.length === 2 ? new Date(dates[1]).getTime() : start;
      result = result.filter(r => {
        const itemDate = new Date(r.date).getTime();
        return itemDate >= start && itemDate <= end;
      });
    }
  }
  
  return result;
});

const currentPage = ref(1);
const itemsPerPage = ref(10);

const paginatedRoles = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredRoles.value.slice(start, end);
});

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};
</script>
