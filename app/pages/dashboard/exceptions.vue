<template>
 <div class="space-y-6">
    <div v-if="isLoading" class="py-20">
      <UiPulseLoader />
    </div>
    <div v-else class="space-y-6">
 <div>
 <p class="text-sm text-slate-500 mt-1">Manage and resolve cases flagged for manual intervention.</p>
 </div>

 <!-- Filters -->
 <div class="bg-white rounded-2xl p-4 border border-slate-200 flex items-center gap-4">
 <div class="flex-1">
 <UiInput placeholder="Search by Reference ID..." />
 </div>
 <div class="w-48">
 <UiSelect 
 placeholder="All Teams"
 :options="[{label: 'Risk & Compliance', value: 'Risk & Compliance'}, {label: 'Internal Control', value: 'Internal Control'}, {label: 'Operations', value: 'Operations'}]" 
 />
 </div>
 <div class="w-40">
 <UiSelect 
 placeholder="All Statuses"
 :options="[{label: 'Open', value: 'Open'}, {label: 'Resolved', value: 'Resolved'}]" 
 />
 </div>
 </div>

 <!-- Exception List -->
 <div class="space-y-4">
 <div v-for="exc in exceptions" :key="exc.id" class="bg-white rounded-2xl p-6 border border-slate-200 flex items-start justify-between group hover:border-emerald-300 transition-colors">
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
import UiInput from '@/components/ui/Input.vue';
import UiSelect from '@/components/ui/Select.vue';

definePageMeta({
 layout: 'dashboard'
});

const { exceptions } = useMockData();
const { addToast } = useToast();

const resolveCase = (exc) => {
 exc.status = 'Resolved';
 addToast(`Exception ${exc.reference} has been resolved successfully.`, 'success');
};

const viewDetails = (exc) => {
 addToast(`Viewing details for ${exc.reference}.`, 'info');
};
</script>
