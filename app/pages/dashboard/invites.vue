<template>
  <main class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Admin Invites</h1>
      <button @click="showCreateInvite = true" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
        Invite Admin
      </button>
    </div>

    <div v-if="loading" class="text-gray-500">Loading invites...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    
    <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="invite in invites" :key="invite.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ invite.email }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ invite.roleId }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span class="px-2 py-1 text-xs rounded-full" 
                    :class="invite.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'">
                {{ invite.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button v-if="invite.status === 'PENDING'" @click="handleResend(invite.id)" class="text-blue-600 hover:text-blue-900">Resend</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="invites.length === 0" class="p-6 text-center text-gray-500">No invites found.</div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useInvites } from '~/composables/modules/useInvites';

definePageMeta({
  layout: 'dashboard'
});

const { loading, error, invites, fetchInvites, resendInvite } = useInvites();
const showCreateInvite = ref(false);

onMounted(() => {
  fetchInvites();
});

const handleResend = async (id: string) => {
  await resendInvite(id);
  alert('Invite resent!');
};
</script>
