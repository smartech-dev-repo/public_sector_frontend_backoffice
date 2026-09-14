<template>
 <div class="space-y-6">
    <div v-if="isLoading" class="py-20">
      <UiPulseLoader />
    </div>
    <div v-else class="space-y-6">
 <div class="flex items-center justify-between mb-8">
 <p class="text-sm text-slate-500 max-w-xl">Upload monthly employer broadsheets to refresh customer eligibility, or upload repayment schedules to update active loan balances in real-time.</p>
 </div>

 <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
 <!-- Broadsheet Upload -->
 <div class="bg-white rounded-2xl border border-slate-200 p-8">
 <div class="flex items-center gap-3 mb-6">
 <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
 </div>
 <div>
 <h3 class="text-slate-800">Employer Broadsheet</h3>
 <p class="text-xs text-slate-500">Supported: .csv, .xlsx</p>
 </div>
 </div>

 <div v-if="broadsheetStatus === 'idle'" class="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-emerald-500 transition-colors cursor-pointer group" @click="simulateUpload('broadsheet')">
 <svg class="w-10 h-10 text-slate-400 group-hover:text-emerald-500 mx-auto mb-4 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
 <div class="text-sm text-slate-700">Click to upload or drag and drop</div>
 <div class="text-xs text-slate-500 mt-1">Maximum file size: 50MB</div>
 </div>

 <div v-else-if="broadsheetStatus === 'uploading'" class="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
 <div class="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
 <div class="text-sm text-slate-700">Validating data structure...</div>
 <div class="w-full bg-slate-200 rounded-full h-2 mt-4">
 <div class="bg-emerald-500 h-2 rounded-full animate-pulse w-3/4"></div>
 </div>
 </div>

 <div v-else-if="broadsheetStatus === 'success'" class="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center relative">
 <button @click="broadsheetStatus = 'idle'" class="absolute top-4 right-4 text-emerald-600 hover:text-emerald-800">
 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
 </button>
 <svg class="w-12 h-12 text-emerald-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
 <div class="text-sm text-emerald-900">Upload Successful</div>
 <div class="text-xs text-emerald-700 mt-1">12,543 records updated across 4 sectors.</div>
 </div>
 </div>

 <!-- Repayment Schedule Upload -->
 <div class="bg-white rounded-2xl border border-slate-200 p-8">
 <div class="flex items-center gap-3 mb-6">
 <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
 </div>
 <div>
 <h3 class="text-slate-800">Repayment Schedules</h3>
 <p class="text-xs text-slate-500">Supported: .csv, .xlsx</p>
 </div>
 </div>

 <div v-if="repaymentStatus === 'idle'" class="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-emerald-500 transition-colors cursor-pointer group" @click="simulateUpload('repayment')">
 <svg class="w-10 h-10 text-slate-400 group-hover:text-emerald-500 mx-auto mb-4 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
 <div class="text-sm text-slate-700">Click to upload or drag and drop</div>
 <div class="text-xs text-slate-500 mt-1">Maximum file size: 50MB</div>
 </div>

 <div v-else-if="repaymentStatus === 'uploading'" class="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
 <div class="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
 <div class="text-sm text-slate-700">Validating data structure...</div>
 <div class="w-full bg-slate-200 rounded-full h-2 mt-4">
 <div class="bg-emerald-500 h-2 rounded-full animate-pulse w-3/4"></div>
 </div>
 </div>

 <div v-else-if="repaymentStatus === 'success'" class="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center relative">
 <button @click="repaymentStatus = 'idle'" class="absolute top-4 right-4 text-emerald-600 hover:text-emerald-800">
 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
 </button>
 <svg class="w-12 h-12 text-emerald-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
 <div class="text-sm text-emerald-900">Upload Successful</div>
 <div class="text-xs text-emerald-700 mt-1">Loan balances updated for 8,201 customers.</div>
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


definePageMeta({
 layout: 'dashboard'
});

const broadsheetStatus = ref('idle');
const repaymentStatus = ref('idle');

const simulateUpload = (type) => {
 if (type === 'broadsheet') {
 broadsheetStatus.value = 'uploading';
 setTimeout(() => { broadsheetStatus.value = 'success'; }, 2000);
 } else {
 repaymentStatus.value = 'uploading';
 setTimeout(() => { repaymentStatus.value = 'success'; }, 2000);
 }
};
</script>
