<template>
 <div class="space-y-6">
 <div v-if="isLoading" class="py-20">
 <UiPulseLoader />
 </div>
 <div v-else class="space-y-6">
 <div class="flex items-center justify-between mb-8">
 <button @click="showAddModal = true" class="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-5 rounded-lg transition-all flex items-center gap-2">
 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
 Create Officer
 </button>
 </div>

 <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
 <div class="overflow-x-auto">
 <table class="w-full text-sm text-left">
 <thead class="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
 <tr>
 <th scope="col" class="px-6 py-4 tracking-wider">Name / ID</th>
 <th scope="col" class="px-6 py-4 tracking-wider">Role</th>
 <th scope="col" class="px-6 py-4 tracking-wider">Status</th>
 <th scope="col" class="px-6 py-4 tracking-wider">Performance (Target)</th>
 <th scope="col" class="px-6 py-4 tracking-wider text-right">Action</th>
 </tr>
 </thead>
 <tbody class="divide-y divide-slate-100">
 <tr v-for="member in teamMembers" :key="member.id" class="hover:bg-slate-50/50 transition-colors">
 <td class="px-6 py-4">
 <div class="text-slate-800">{{ member.name }}</div>
 <div class="text-xs font-mono text-slate-500">{{ member.id }}</div>
 </td>
 <td class="px-6 py-4 font-medium text-slate-700">{{ member.role }}</td>
 <td class="px-6 py-4">
 <span class="px-2.5 py-1 rounded-md text-xs whitespace-nowrap"
 :class="member.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'">
 {{ member.status }}
 </span>
 </td>
 <td class="px-6 py-4">
 <div class="flex items-center gap-3">
 <div class="w-full bg-slate-100 rounded-full h-2 max-w-[120px]">
 <div class="bg-emerald-500 h-2 rounded-full" :style="`width: ${(member.achieved / member.target) * 100}%`"></div>
 </div>
 <span class="text-xs text-slate-600">{{ member.achieved }} / {{ member.target }}</span>
 </div>
 </td>
 <td class="px-6 py-4 text-right">
 <div class="flex justify-end">
 <UiTableDropdown>
 <button @click="editTarget(member)" class="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
 Set Target
 </button>
 <button @click="confirmRevokeAccess(member)" class="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors">
 Revoke Access
 </button>
 </UiTableDropdown>
 </div>
 </td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>

 <!-- Create Officer Modal -->
 <Teleport to="body">
 <div v-if="showAddModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
 <div class="bg-white rounded-3xl w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-200">
 <h3 class="text-xl text-slate-800 mb-2">Create New Officer</h3>
 <p class="text-sm text-slate-500 mb-6">A secure welcome email and time-limited access link will be sent.</p>
 
 <form @submit.prevent="createOfficer" class="space-y-4">
 <UiInput label="Full Name" placeholder="e.g. John Doe" required />
 <UiInput label="Email Address" type="email" placeholder="e.g. john@bank.com" required />
 <UiInput label="Initial Target (Monthly)" type="number" :modelValue="50" required />
 
 <div class="flex gap-3 mt-8">
 <button type="button" @click="showAddModal = false" class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors">
 Cancel
 </button>
 <button type="submit" class="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors">
 Send Invite
 </button>
 </div>
 </form>
 </div>
 </div>
 </Teleport>

 <!-- Edit Target Modal -->
 <UiModal v-model="showTargetModal" title="Set New Target" @confirm="saveTarget">
 <div class="space-y-4">
 <p class="text-sm">Set a new monthly target for <strong>{{ pendingMember?.name }}</strong>.</p>
 <UiInput label="New Target" type="number" v-model="newTargetValue" />
 </div>
 </UiModal>

 <!-- Revoke Access Confirmation Modal -->
 <UiModal v-model="showRevokeModal" title="Confirm Revocation" @confirm="executeRevokeAccess">
 <p class="text-sm">Are you sure you want to revoke platform access for <strong>{{ memberToRevoke?.name }}</strong>? They will be immediately disconnected.</p>
 </UiModal>
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
import UiModal from '@/components/ui/Modal.vue';
import UiInput from '@/components/ui/Input.vue';
import UiTableDropdown from '@/components/ui/TableDropdown.vue';

definePageMeta({
 layout: 'dashboard'
});

const { teamMembers } = useMockData();
const { addToast } = useToast();

const showAddModal = ref(false);
const showTargetModal = ref(false);
const pendingMember = ref(null);
const newTargetValue = ref(0);

const showRevokeModal = ref(false);
const memberToRevoke = ref(null);

const confirmRevokeAccess = (member) => {
 memberToRevoke.value = member;
 showRevokeModal.value = true;
};

const executeRevokeAccess = () => {
 if (memberToRevoke.value) {
 memberToRevoke.value.status = 'Inactive';
 addToast(`${memberToRevoke.value.name}'s access has been successfully revoked.`, 'warning');
 }
 showRevokeModal.value = false;
};

const editTarget = (member) => {
 pendingMember.value = member;
 newTargetValue.value = member.target;
 showTargetModal.value = true;
};

const saveTarget = () => {
 if (pendingMember.value && !isNaN(newTargetValue.value) && newTargetValue.value > 0) {
 pendingMember.value.target = parseInt(newTargetValue.value, 10);
 addToast(`Target for ${pendingMember.value.name} updated successfully.`, 'success');
 } else {
 addToast('Invalid target value.', 'error');
 }
 showTargetModal.value = false;
 pendingMember.value = null;
};

const createOfficer = () => {
 addToast('Officer created! Secure welcome email has been sent.', 'success');
 showAddModal.value = false;
};
</script>
