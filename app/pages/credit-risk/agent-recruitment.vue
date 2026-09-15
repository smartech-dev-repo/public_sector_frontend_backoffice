<template>
  <div class="space-y-6 relative h-full">
    <!-- Actions -->
    <div class="flex items-center justify-end gap-3 relative">
      <span class="text-sm text-slate-400 mr-2">Showing {{ filteredAgents.length }} of {{ agentsData.length }}</span>
      
      <!-- Filter Button -->
      <button @click="showFilter = !showFilter" class="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
        Filter
      </button>

      <!-- Filter Dropdown -->
      <div v-if="showFilter" class="absolute top-10 right-36 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50">
        <h3 class="text-sm font-semibold text-slate-900 mb-3">Filter Agents</h3>
        <input v-model="searchQuery" type="text" placeholder="Search by name or NIN..." class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mb-3 focus:outline-none focus:border-emerald-500">
        <button @click="showFilter = false" class="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">Apply Filter</button>
      </div>

      <!-- Export Button -->
      <button @click="handleExportExcel" class="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
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
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Status</th>
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
              <td class="px-6 py-4 text-slate-600 truncate max-w-[200px]">{{ agent.address }}</td>
              <td class="px-6 py-4 text-slate-600">{{ agent.date }}</td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border border-emerald-200 text-emerald-600 bg-white">
                  {{ agent.status }}
                </span>
              </td>
              <td class="px-6 py-4">
                <button @click="openModal(agent)" class="font-medium text-slate-900 hover:text-emerald-600 transition-colors">
                  View
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

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="selectedAgent" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="closeModal"></div>
      
      <!-- Modal Content -->
      <div class="relative bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-8 space-y-6">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-2xl font-semibold text-slate-900">{{ selectedAgent.name }}</h2>
              <p class="text-[13px] text-slate-500 mt-1">{{ selectedAgent.date }}</p>
            </div>
          </div>

          <!-- Info Grid -->
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p class="text-[11px] text-slate-400 mb-1">Name</p>
              <p class="text-[15px] font-semibold text-slate-900">{{ selectedAgent.name }}</p>
            </div>
            <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p class="text-[11px] text-slate-400 mb-1">Phone</p>
              <p class="text-[15px] font-semibold text-slate-900">{{ selectedAgent.phone }}</p>
            </div>
            <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p class="text-[11px] text-slate-400 mb-1">Bvn</p>
              <p class="text-[15px] font-semibold text-slate-900">{{ selectedAgent.bvn }}</p>
            </div>
            <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p class="text-[11px] text-slate-400 mb-1">Nin</p>
              <p class="text-[15px] font-semibold text-slate-900">{{ selectedAgent.nin }}</p>
            </div>
            <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p class="text-[11px] text-slate-400 mb-1">Gender</p>
              <p class="text-[15px] font-semibold text-slate-900">{{ selectedAgent.gender }}</p>
            </div>
            <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p class="text-[11px] text-slate-400 mb-1">Nationality</p>
              <p class="text-[15px] font-semibold text-slate-900">Nigerian</p>
            </div>
            <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100 col-span-2">
              <p class="text-[11px] text-slate-400 mb-1">Address</p>
              <p class="text-[15px] font-semibold text-slate-900">{{ selectedAgent.address }}</p>
            </div>
          </div>

          <!-- Documents -->
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100 relative group overflow-hidden">
              <div class="w-full h-40 bg-slate-200 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden">
                <!-- Fake document image -->
                <div class="w-[80%] h-[90%] bg-white shadow-sm border border-slate-300 p-2 text-[4px] text-slate-300 leading-tight">
                  <div class="font-bold text-slate-800 text-[6px] mb-2 text-center uppercase tracking-widest">{{ selectedAgent.name }}</div>
                  <div class="w-full h-[1px] bg-slate-200 mb-2"></div>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.
                </div>
                <!-- Hover Overlay -->
                <div class="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button @click="handleDocDownload('Resume')" class="bg-white/90 backdrop-blur border border-slate-200 rounded-lg px-4 py-2 text-xs font-medium text-slate-700 flex items-center gap-2 shadow-sm hover:bg-slate-50">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Download
                  </button>
                </div>
              </div>
              <h4 class="text-sm font-semibold text-slate-900">Resume.pdf</h4>
              <p class="text-[11px] text-slate-400">3MB &bull; 1 Page</p>
            </div>

            <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100 relative group overflow-hidden">
              <div class="w-full h-40 bg-slate-200 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden">
                <!-- Fake document image -->
                <div class="w-[80%] h-[90%] bg-white shadow-sm border border-slate-300 p-2 text-[4px] text-slate-300 leading-tight">
                  <div class="font-bold text-slate-800 text-[6px] mb-2 text-center uppercase tracking-widest">{{ selectedAgent.name }}</div>
                  <div class="w-full h-[1px] bg-slate-200 mb-2"></div>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.
                </div>
                <!-- Hover Overlay -->
                <div class="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button @click="handleDocDownload('ID_Card')" class="bg-white/90 backdrop-blur border border-slate-200 rounded-lg px-4 py-2 text-xs font-medium text-slate-700 flex items-center gap-2 shadow-sm hover:bg-slate-50">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Download
                  </button>
                </div>
              </div>
              <h4 class="text-sm font-semibold text-slate-900">ID_Card.pdf</h4>
              <p class="text-[11px] text-slate-400">1.2MB &bull; 1 Page</p>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex gap-4 pt-4 border-t border-slate-100">
            <button @click="handleReject" class="px-6 py-3 rounded-xl border border-emerald-500 text-emerald-600 font-medium hover:bg-emerald-50 transition-colors w-32 shrink-0">
              Reject
            </button>
            <button @click="handleRecommend" class="flex-1 py-3 px-6 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors">
              Recommend
            </button>
          </div>
        </div>
      </div>
    </Teleport>
    <!-- Confirmation Modal -->
    <UiModal v-model="showConfirmModal" :title="confirmTitle" @confirm="executeAction">
      <p class="text-sm">{{ confirmMessage }}</p>
    </UiModal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import UiModal from '@/components/ui/Modal.vue';
import UiPagination from '@/components/ui/Pagination.vue';
import { useToast } from '@/composables/useToast';

definePageMeta({
  layout: 'credit-risk'
});

// State
const showFilter = ref(false);
const searchQuery = ref('');
const selectedAgent = ref(null);
const { addToast } = useToast();

const showConfirmModal = ref(false);
const confirmTitle = ref('');
const confirmMessage = ref('');
const pendingAction = ref('');

// Mock Data
const agentsData = ref([
  { id: 1, name: 'Adaeze Nwosu', nin: '23598720984', address: '9 Chime Ave, New Haven Layout, Enugu', date: '16 Aug 2026', status: 'Recommend', phone: '08031234821', bvn: '123456784821', gender: 'Female' },
  { id: 2, name: 'Chukwuemeka Ibe', nin: '12345678901', address: '14 Adeniran Ogunsanya St, Surulere, Lagos', date: '30 Jul 2026', status: 'Recommend', phone: '08123456789', bvn: '987654321012', gender: 'Male' },
  { id: 3, name: 'Fatima Bello', nin: '87654321098', address: '22 Gwarinpa Estate, Abuja', date: '12 Aug 2026', status: 'Recommend', phone: '07087654321', bvn: '345678901234', gender: 'Female' },
  { id: 4, name: 'Oluwaseun Adeyemi', nin: '34567890123', address: '5 Allen Avenue, Ikeja, Lagos', date: '05 Aug 2026', status: 'Recommend', phone: '09012345678', bvn: '567890123456', gender: 'Male' },
  { id: 5, name: 'Ngozi Okoro', nin: '56789012345', address: '18 Wetheral Road, Owerri, Imo', date: '22 Jul 2026', status: 'Recommend', phone: '08098765432', bvn: '789012345678', gender: 'Female' },
  { id: 6, name: 'Ibrahim Musa', nin: '90123456789', address: '10 Ahmadu Bello Way, Kaduna', date: '18 Aug 2026', status: 'Recommend', phone: '08134567890', bvn: '901234567890', gender: 'Male' },
  { id: 7, name: 'Aisha Suleiman', nin: '23456789012', address: '7 Zoo Road, Kano', date: '01 Aug 2026', status: 'Recommend', phone: '07023456789', bvn: '123450987654', gender: 'Female' },
  { id: 8, name: 'Tunde Bakare', nin: '67890123456', address: '3 Ring Road, Ibadan, Oyo', date: '15 Jul 2026', status: 'Recommend', phone: '08045678901', bvn: '345671234567', gender: 'Male' },
]);

// Computed
const filteredAgents = computed(() => {
  let result = agentsData.value;
  if (searchQuery.value) {
    const lower = searchQuery.value.toLowerCase();
    result = result.filter(agent => 
      agent.name.toLowerCase().includes(lower) || 
      agent.nin.includes(lower) ||
      agent.status.toLowerCase().includes(lower)
    );
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

// Actions
const openModal = (agent) => {
  selectedAgent.value = agent;
};

const closeModal = () => {
  selectedAgent.value = null;
};

const handleExportExcel = () => {
  addToast('Exporting agents to Excel...', 'success');
  const content = `Mock Agent Export\nGenerated on ${new Date().toISOString()}`;
  const blob = new Blob([content], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `agents_export.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

const handleDocDownload = (docName) => {
  if (!selectedAgent.value) return;
  addToast(`Downloading ${docName} for ${selectedAgent.value.name}`, 'success');
  const content = `Mock Document: ${docName}\nFor: ${selectedAgent.value.name}`;
  const blob = new Blob([content], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${docName}_${selectedAgent.value.name.replace(' ', '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

const handleRecommend = () => {
  confirmTitle.value = 'Recommend Application';
  confirmMessage.value = 'Are you sure you want to recommend this application to Internal Control?';
  pendingAction.value = 'Recommend';
  showConfirmModal.value = true;
};

const handleReject = () => {
  confirmTitle.value = 'Reject Application';
  confirmMessage.value = 'Are you sure you want to reject this application? This action cannot be undone.';
  pendingAction.value = 'Reject';
  showConfirmModal.value = true;
};

const executeAction = () => {
  if (pendingAction.value === 'Recommend') {
    addToast(`Agent ${selectedAgent.value.name} has been recommended!`, 'success');
    const index = agentsData.value.findIndex(a => a.id === selectedAgent.value.id);
    if(index !== -1) {
      agentsData.value[index].status = 'Approved';
    }
  } else if (pendingAction.value === 'Reject') {
    addToast(`Agent ${selectedAgent.value.name} has been rejected.`, 'warning');
    const index = agentsData.value.findIndex(a => a.id === selectedAgent.value.id);
    if(index !== -1) {
      agentsData.value[index].status = 'Rejected';
    }
  }
  showConfirmModal.value = false;
  closeModal();
};
</script>
