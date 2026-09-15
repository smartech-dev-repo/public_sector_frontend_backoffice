<template>
  <div class="space-y-6">
    <!-- Actions -->
    <div class="flex items-center justify-end gap-3 relative">
      <span class="text-sm text-slate-400 mr-2">Showing {{ filteredIppis.length + filteredRepayment.length }} uploads</span>
      
      <!-- Filter Button -->
      <button @click="showFilter = !showFilter" class="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
        Filter
      </button>

      <!-- Filter Dropdown -->
      <div v-if="showFilter" class="absolute top-10 right-32 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50">
        <h3 class="text-sm font-semibold text-slate-900 mb-3">Filter Uploads</h3>
        
        <div class="space-y-3 mb-4">
          <input v-model="filterParams.search" type="text" placeholder="Search by month or user..." class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500">
          
          <UiSelect 
            v-model="filterParams.status"
            placeholder="All Statuses"
            :options="[{label: 'All Statuses', value: ''}, {label: 'Validated', value: 'Validated'}, {label: 'Pending', value: 'Pending'}]" 
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

      <!-- Export Button -->
      <button @click="handleExportExcel" class="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        Export as Excel (.xlsx)
      </button>
    </div>

    <!-- Columns -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      <!-- IPPIS Broadsheet Column -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-6">
        <h2 class="text-lg font-semibold text-slate-900">IPPIS Broadsheet</h2>
        
        <!-- Upload Box -->
        <div @click="triggerIppisUpload" class="border border-dashed border-emerald-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-emerald-50/30 hover:bg-emerald-50/50 transition-colors cursor-pointer relative overflow-hidden group">
          <input type="file" ref="ippisFileInput" class="hidden" @change="handleIppisUpload" accept=".csv, .xlsx" />
          <svg class="w-6 h-6 text-slate-400 mb-3 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          <p class="text-sm text-slate-400">Drag and drop or <span class="text-emerald-600 font-medium">choose file</span> to upload</p>
          <p class="text-xs text-slate-400 mt-1">.xlsx or .csv</p>
        </div>

        <!-- List -->
        <div class="space-y-4">
          <div v-if="filteredIppis.length === 0" class="text-center py-4 text-sm text-slate-500">
            No IPPIS uploads found.
          </div>
          <div v-for="item in filteredIppis" :key="item.id" class="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 hover:bg-slate-50/30 -mx-2 px-2 rounded-lg transition-colors">
            <div>
              <div class="flex items-center gap-3 mb-1">
                <span class="font-semibold text-slate-800">{{ item.month }}</span>
                <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-medium border border-emerald-100/50">{{ item.status }}</span>
              </div>
              <p class="text-[12px] text-slate-400">{{ item.user }} &bull; {{ item.date }}</p>
            </div>
            <button @click="handleDownload(item, 'IPPIS')" class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white text-xs font-medium transition-colors shadow-sm">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Download
            </button>
          </div>
        </div>
      </div>

      <!-- Repayment Schedule Column -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-6">
        <h2 class="text-lg font-semibold text-slate-900">Repayment Schedule</h2>
        
        <!-- Upload Box -->
        <div @click="triggerRepaymentUpload" class="border border-dashed border-emerald-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-emerald-50/30 hover:bg-emerald-50/50 transition-colors cursor-pointer relative overflow-hidden group">
          <input type="file" ref="repaymentFileInput" class="hidden" @change="handleRepaymentUpload" accept=".csv, .xlsx" />
          <svg class="w-6 h-6 text-slate-400 mb-3 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          <p class="text-sm text-slate-400">Drag and drop or <span class="text-emerald-600 font-medium">choose file</span> to upload</p>
          <p class="text-xs text-slate-400 mt-1">.xlsx or .csv</p>
        </div>

        <!-- List -->
        <div class="space-y-4">
          <div v-if="filteredRepayment.length === 0" class="text-center py-4 text-sm text-slate-500">
            No repayment schedules found.
          </div>
          <div v-for="item in filteredRepayment" :key="item.id" class="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 hover:bg-slate-50/30 -mx-2 px-2 rounded-lg transition-colors">
            <div>
              <div class="flex items-center gap-3 mb-1">
                <span class="font-semibold text-slate-800">{{ item.month }}</span>
                <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-medium border border-emerald-100/50">{{ item.status }}</span>
              </div>
              <p class="text-[12px] text-slate-400">{{ item.user }} &bull; {{ item.date }}</p>
            </div>
            <button @click="handleDownload(item, 'Repayment')" class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white text-xs font-medium transition-colors shadow-sm">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Download
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useToast } from '@/composables/useToast';
import UiSelect from '@/components/ui/Select.vue';
import UiDatePicker from '@/components/ui/DatePicker.vue';

definePageMeta({
  layout: 'credit-risk'
});

const { addToast } = useToast();

// State
const showFilter = ref(false);
const filterParams = ref({
  search: '',
  status: '',
  dateRange: ''
});

const clearFilters = () => {
  filterParams.value = { search: '', status: '', dateRange: '' };
};

const ippisFileInput = ref(null);
const repaymentFileInput = ref(null);

// Mock Data
const ippisData = ref([
  { id: 1, month: 'July 2026', status: 'Validated', user: 'Darmian Moses', date: '2nd of July, 2026' },
  { id: 2, month: 'June 2026', status: 'Validated', user: 'Darmian Moses', date: '2nd of June, 2026' },
  { id: 3, month: 'May 2026', status: 'Validated', user: 'Adaeze Nwosu', date: '1st of May, 2026' },
  { id: 4, month: 'April 2026', status: 'Validated', user: 'Darmian Moses', date: '4th of April, 2026' },
  { id: 5, month: 'March 2026', status: 'Validated', user: 'Darmian Moses', date: '2nd of March, 2026' }
]);

const repaymentData = ref([
  { id: 1, month: 'July 2026', status: 'Validated', user: 'Darmian Moses', date: '2nd of July, 2026' },
  { id: 2, month: 'June 2026', status: 'Validated', user: 'Adaeze Nwosu', date: '3rd of June, 2026' },
  { id: 3, month: 'May 2026', status: 'Validated', user: 'Darmian Moses', date: '2nd of May, 2026' },
  { id: 4, month: 'April 2026', status: 'Validated', user: 'Darmian Moses', date: '2nd of April, 2026' },
  { id: 5, month: 'March 2026', status: 'Validated', user: 'Adaeze Nwosu', date: '5th of March, 2026' }
]);

// Computed
const parseMockDate = (dateStr) => {
  // Convert "2nd of July, 2026" -> "2 July 2026"
  const cleaned = dateStr.replace(/(st|nd|rd|th)\s+of\s+/, ' ').replace(',', '');
  return new Date(cleaned).getTime();
};

const filterData = (dataArray) => {
  let result = dataArray;
  
  if (filterParams.value.search) {
    const lower = filterParams.value.search.toLowerCase();
    result = result.filter(item => 
      item.month.toLowerCase().includes(lower) || 
      item.user.toLowerCase().includes(lower)
    );
  }
  
  if (filterParams.value.status) {
    result = result.filter(item => item.status === filterParams.value.status);
  }
  
  if (filterParams.value.dateRange) {
    const dates = filterParams.value.dateRange.split(' to ');
    if (dates.length > 0) {
      const start = new Date(dates[0]).getTime();
      const end = dates.length === 2 ? new Date(dates[1]).getTime() : start;
      result = result.filter(item => {
        const itemDate = parseMockDate(item.date);
        return itemDate >= start && itemDate <= end;
      });
    }
  }
  
  return result;
};

const filteredIppis = computed(() => {
  return filterData(ippisData.value);
});

const filteredRepayment = computed(() => {
  return filterData(repaymentData.value);
});

// Actions
const triggerIppisUpload = () => {
  ippisFileInput.value?.click();
};

const triggerRepaymentUpload = () => {
  repaymentFileInput.value?.click();
};

const handleIppisUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    addToast(`File selected: ${file.name}\nReady for backend upload processing.`, 'success');
    // Reset input
    event.target.value = '';
  }
};

const handleRepaymentUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    addToast(`File selected: ${file.name}\nReady for backend upload processing.`, 'success');
    // Reset input
    event.target.value = '';
  }
};

const handleDownload = (item, type) => {
  // Simulate file download
  const content = `Mock ${type} Data for ${item.month}\nGenerated on ${new Date().toISOString()}`;
  const blob = new Blob([content], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${type.toLowerCase()}_${item.month.replace(' ', '_')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

const handleExportExcel = () => {
  addToast('Exporting all data to Excel...', 'success');
  // Same simulated download logic could go here for the full sheet
  const content = `Mock Complete Export\nGenerated on ${new Date().toISOString()}`;
  const blob = new Blob([content], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `full_export.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
</script>
