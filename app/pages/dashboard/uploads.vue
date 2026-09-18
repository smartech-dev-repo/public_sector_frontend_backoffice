<template>
  <main class="p-6 space-y-6">
    <div v-if="isLoading" class="py-20 text-center text-slate-500">
      Loading...
    </div>
    <div v-else class="space-y-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-slate-800">Document Uploads</h1>
          <p class="text-sm text-slate-500 mt-1 max-w-xl">Upload monthly employer broadsheets, disbursed loans, or repayment schedules.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Broadsheet Upload -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <div>
              <h3 class="text-slate-800 font-medium text-sm">IPPIS Broadsheet</h3>
              <p class="text-xs text-slate-500">.csv, .xlsx</p>
            </div>
          </div>
          <div class="mt-auto border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-emerald-500 transition-colors cursor-pointer" @click="triggerFileSelect('broadsheet')">
            <div class="text-xs text-slate-600 font-medium">Select File</div>
          </div>
          <input type="file" ref="broadsheetInput" class="hidden" @change="handleFileUpload($event, 'broadsheet')" accept=".csv,.xlsx" />
        </div>

        <!-- Disbursed Loans Upload -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <h3 class="text-slate-800 font-medium text-sm">Disbursed Loans</h3>
              <p class="text-xs text-slate-500">.csv, .xlsx</p>
            </div>
          </div>
          <div class="mt-auto border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-purple-500 transition-colors cursor-pointer" @click="triggerFileSelect('disbursed')">
            <div class="text-xs text-slate-600 font-medium">Select File</div>
          </div>
          <input type="file" ref="disbursedInput" class="hidden" @change="handleFileUpload($event, 'disbursed')" accept=".csv,.xlsx" />
        </div>

        <!-- Repayment Schedule Upload -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <div>
              <h3 class="text-slate-800 font-medium text-sm">Repayment Schedule</h3>
              <p class="text-xs text-slate-500">.csv, .xlsx</p>
            </div>
          </div>
          <div class="mt-auto border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-amber-500 transition-colors cursor-pointer" @click="triggerFileSelect('repayment')">
            <div class="text-xs text-slate-600 font-medium">Select File</div>
          </div>
          <input type="file" ref="repaymentInput" class="hidden" @change="handleFileUpload($event, 'repayment')" accept=".csv,.xlsx" />
        </div>
      </div>

      <div>
        <h2 class="text-lg font-semibold text-slate-800 mb-4">Upload Batches</h2>
        <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Rows</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Processed</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="batch in batches" :key="batch.id" class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-mono">{{ batch.id }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{{ batch.documentType }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span class="px-2.5 py-1 text-xs rounded-full font-medium" :class="statusClass(batch.status)">
                    {{ batch.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{{ batch.totalRows || 0 }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{{ batch.processedRows || 0 }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{{ new Date(batch.createdAt).toLocaleDateString() }}</td>
              </tr>
              <tr v-if="batches.length === 0">
                <td colspan="6" class="p-8 text-center text-slate-400">No batches found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useDocuments } from '~/composables/modules/useDocuments';
import { useToast } from '@/composables/useToast';

definePageMeta({ layout: 'dashboard' });

const { loading, batches, fetchDocumentBatches, uploadIppisBroadsheet, uploadDisbursedLoans, uploadRepaymentSchedule } = useDocuments();
const { addToast } = useToast();

const isLoading = ref(true);

const broadsheetInput = ref<HTMLInputElement | null>(null);
const disbursedInput = ref<HTMLInputElement | null>(null);
const repaymentInput = ref<HTMLInputElement | null>(null);

onMounted(async () => {
  await fetchDocumentBatches();
  isLoading.value = false;
});

const triggerFileSelect = (type: string) => {
  if (type === 'broadsheet') broadsheetInput.value?.click();
  else if (type === 'disbursed') disbursedInput.value?.click();
  else if (type === 'repayment') repaymentInput.value?.click();
};

const handleFileUpload = async (event: Event, type: string) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  try {
    if (type === 'broadsheet') {
      await uploadIppisBroadsheet(formData);
    } else if (type === 'disbursed') {
      await uploadDisbursedLoans(formData);
    } else if (type === 'repayment') {
      await uploadRepaymentSchedule(formData);
    }
    addToast('File uploaded successfully. Processing started.', 'success');
    await fetchDocumentBatches();
  } catch (err: any) {
    addToast(err?.response?.data?.message || 'File upload failed', 'error');
  } finally {
    // Reset input
    if (target) target.value = '';
  }
};

const statusClass = (status: string) => {
  switch (status) {
    case 'COMPLETED': return 'bg-emerald-100 text-emerald-800';
    case 'PROCESSING': return 'bg-blue-100 text-blue-800';
    case 'FAILED': return 'bg-rose-100 text-rose-800';
    default: return 'bg-amber-100 text-amber-800';
  }
};
</script>
