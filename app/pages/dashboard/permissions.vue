<template>
  <main class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Permissions</h1>
    </div>

    <div v-if="loading" class="text-gray-500">Loading permissions...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    
    <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Key</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="permission in permissions" :key="permission.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ permission.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">{{ permission.key }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ permission.description }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="permissions.length === 0" class="p-6 text-center text-gray-500">No permissions found.</div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { usePermissions } from '~/composables/modules/usePermissions';

definePageMeta({
  layout: 'dashboard'
});

const { loading, error, permissions, fetchPermissions } = usePermissions();

onMounted(() => {
  fetchPermissions();
});
</script>
