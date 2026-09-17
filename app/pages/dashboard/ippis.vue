<template>
  <main class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-slate-800">IPPIS Documents</h1>
      <button class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
        Upload Document
      </button>
    </div>

    <div v-if="loading" class="text-slate-500 py-12 text-center">Loading documents...</div>
    <div v-else-if="error" class="text-red-500 py-12 text-center">{{ error }}</div>
    
    <div v-else class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="batch in batches" :key="batch.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-mono">{{ batch.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-medium">{{ batch.documentType }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span class="px-2.5 py-1 text-xs rounded-full font-medium" 
                    :class="batch.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'">
                {{ batch.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{{ new Date(batch.createdAt).toLocaleDateString() }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="batches.length === 0" class="p-8 text-center text-slate-400">No document batches found.</div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useIppis } from '~/composables/modules/useIppis';

definePageMeta({
  layout: 'dashboard'
});

const { loading, error, batches, fetchBatches } = useIppis();

onMounted(() => {
  fetchBatches();
});
</script>
