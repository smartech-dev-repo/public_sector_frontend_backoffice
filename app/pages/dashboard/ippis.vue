<template>
  <main class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">IPPIS Documents</h1>
      <button class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
        Upload Document
      </button>
    </div>

    <div v-if="loading" class="text-gray-500">Loading documents...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    
    <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="batch in batches" :key="batch.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ batch.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">{{ batch.documentType }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span class="px-2 py-1 text-xs rounded-full" 
                    :class="batch.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">
                {{ batch.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ new Date(batch.createdAt).toLocaleDateString() }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="batches.length === 0" class="p-6 text-center text-gray-500">No document batches found.</div>
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
