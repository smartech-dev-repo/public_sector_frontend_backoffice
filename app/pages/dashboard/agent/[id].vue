<template>
 <div class="space-y-6" v-if="application">
 <div class="flex items-center justify-between mb-6">
 <NuxtLink to="/dashboard" class="flex items-center text-sm text-slate-500 hover:text-emerald-600 transition-colors">
 <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
 Back to Queue
 </NuxtLink>
 <span class="px-3 py-1.5 rounded-lg text-xs whitespace-nowrap"
 :class="{ 'bg-amber-100 text-amber-700': currentStatus === 'Pending Review', 'bg-blue-100 text-blue-700': currentStatus === 'Recommended', 'bg-emerald-100 text-emerald-700': currentStatus === 'Approved', 'bg-rose-100 text-rose-700': currentStatus === 'Rejected' }">
 {{ currentStatus }}
 </span>
 </div>

 <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:p-6">
 <!-- Applicant Info -->
 <div class="col-span-2 space-y-6">
 <div class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-4 sm:p-6">
 <h2 class="text-xl text-slate-800 mb-6 border-b border-slate-100 pb-4">Applicant Information</h2>
 <div class="grid grid-cols-2 gap-y-6 gap-x-4">
 <div>
 <div class="text-xs text-slate-400 uppercase tracking-wider mb-1">Full Name</div>
 <div class="font-medium text-slate-800 text-lg">{{ application.name }}</div>
 </div>
 <div>
 <div class="text-xs text-slate-400 uppercase tracking-wider mb-1">Application Ref</div>
 <div class="font-mono text-slate-800">{{ application.id }}</div>
 </div>
 <div>
 <div class="text-xs text-slate-400 uppercase tracking-wider mb-1">Phone Number</div>
 <div class="font-medium text-slate-800">{{ application.phone }}</div>
 </div>
 <div>
 <div class="text-xs text-slate-400 uppercase tracking-wider mb-1">Submission Date</div>
 <div class="font-medium text-slate-800">{{ application.dateSubmitted }}</div>
 </div>
 </div>
 </div>

 <div class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-4 sm:p-6">
 <h2 class="text-xl text-slate-800 mb-6 border-b border-slate-100 pb-4">KYC & Identity</h2>
 <div class="grid grid-cols-2 gap-4 sm:p-6">
 <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
 <div class="text-xs text-slate-500 uppercase tracking-wider mb-2">BVN Match</div>
 <div class="font-mono text-slate-800 text-lg">{{ application.bvn }}</div>
 <div class="mt-2 text-sm text-emerald-600 flex items-center gap-1">
 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
 Identity Confirmed
 </div>
 </div>
 <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
 <div class="text-xs text-slate-500 uppercase tracking-wider mb-2">NIN Match</div>
 <div class="font-mono text-slate-800 text-lg">{{ application.nin }}</div>
 <div class="mt-2 text-sm text-emerald-600 flex items-center gap-1">
 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
 Identity Confirmed
 </div>
 </div>
 </div>
 </div>
 </div>

 <!-- Actions & Documents -->
 <div class="space-y-6">
 <div class="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">
 <h2 class="text-lg text-slate-800 mb-4">Uploaded Documents</h2>
 <div class="space-y-3">
 <div v-for="doc in application.documents" :key="doc.name" class="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
 <div class="flex items-center gap-3">
 <div class="w-8 h-8 bg-emerald-50 text-emerald-600 rounded flex items-center justify-center text-xs">
 {{ doc.type }}
 </div>
 <div class="text-sm font-medium text-slate-700">{{ doc.name }}</div>
 </div>
 <div class="flex items-center gap-3">
 <span class="text-xs px-2 py-1 rounded whitespace-nowrap" :class="doc.status === 'Missing' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'">
 {{ doc.status }}
 </span>
 <button v-if="doc.status !== 'Missing'" @click="previewDocument(doc)" class="p-1.5 text-slate-400 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 rounded-md transition-colors" title="Preview Document">
 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
 </button>
 </div>
 </div>
 </div>
 </div>

 <div v-if="currentStatus === 'Pending Review'" class="bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-6 text-white">
 <h2 class="text-lg mb-4">Team Lead Action (Maker)</h2>
 <p class="text-sm text-slate-400 mb-6">Review the applicant's details and KYC verification. Recommend to forward to Internal Control.</p>
 
 <div class="space-y-3">
 <button @click="promptAction('Recommended')" class="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors">
 Recommend Agent
 </button>
 <button @click="promptAction('Rejected')" class="w-full py-3 bg-transparent border-2 border-rose-500/30 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors">
 Reject Application
 </button>
 </div>
 </div>

 <div v-if="currentStatus === 'Recommended'" class="bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-6 text-white">
 <h2 class="text-lg mb-4">Internal Control (Checker)</h2>
 <p class="text-sm text-slate-400 mb-6">Perform an independent AML search and approve or reject the recommended agent.</p>
 
 <div class="space-y-3">
 <button @click="promptAction('Approved')" class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors">
 Approve Agent
 </button>
 <button @click="promptAction('Rejected')" class="w-full py-3 bg-transparent border-2 border-rose-500/30 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors">
 Reject Application
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 <div v-else class="text-center py-20 text-slate-500">
 Application not found.
 </div>

 <!-- Rejection Modal -->
 <UiModal v-model="showRejectModal" title="Reject Application" @confirm="confirmAction">
 <div class="space-y-4">
 <p class="text-sm text-slate-600">Please provide a reason for rejecting this application. This will be recorded in the audit log.</p>
 <UiCustomInput v-model="rejectionReason" type="textarea" placeholder="Enter rejection reason..." rows="3" required />
 </div>
 </UiModal>

 <!-- Document Preview Modal -->
 <UiModal v-model="showPreviewModal" title="Document Preview" @confirm="showPreviewModal = false">
 <div class="space-y-4 text-center">
 <p class="text-sm text-slate-600 mb-2">{{ previewedDocument?.name }}</p>
 <div class="bg-slate-100 rounded-xl p-4 flex items-center justify-center min-h-[300px] border border-slate-200">
 <!-- Mock Image Preview -->
 <img v-if="previewedDocument?.type === 'JPG' || previewedDocument?.type === 'PNG'" src="https://images.unsplash.com/photo-1568822617270-2c1579f8dfe2?w=500&q=80" alt="Document Preview" class="max-w-full max-h-[400px] rounded object-contain shadow-sm" />
 <div v-else class="text-slate-400 flex flex-col items-center gap-2">
 <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
 <span class="text-sm">PDF Preview Available in Full Version</span>
 </div>
 </div>
 </div>
 <template #footer>
 <div class="w-full flex justify-end">
 <button @click="showPreviewModal = false" class="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">Close Preview</button>
 </div>
 </template>
 </UiModal>

 <!-- Confirmation Modal -->
 <UiModal v-model="showConfirmModal" :title="confirmTitle" @confirm="confirmAction">
 <p class="text-sm">{{ confirmMessage }}</p>
 </UiModal>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMockData } from '@/composables/modules/useMockData';
import { useToast } from '@/composables/useToast';
import UiModal from '@/components/ui/Modal.vue';

definePageMeta({
 layout: 'dashboard'
});

const route = useRoute();
const router = useRouter();
const { agentApplications } = useMockData();
const { addToast } = useToast();

const application = computed(() => {
 return agentApplications.find(a => a.id === route.params.id);
});

const currentStatus = ref(application.value?.status);
const showConfirmModal = ref(false);
const showRejectModal = ref(false);
const showPreviewModal = ref(false);
const previewedDocument = ref(null);
const pendingAction = ref('');
const confirmTitle = ref('');
const confirmMessage = ref('');
const rejectionReason = ref('');

const previewDocument = (doc) => {
 previewedDocument.value = doc;
 showPreviewModal.value = true;
};

const promptAction = (action) => {
 pendingAction.value = action;
 if (action === 'Recommended') {
 confirmTitle.value = 'Recommend Application';
 confirmMessage.value = 'Are you sure you want to recommend this application to Internal Control?';
 showConfirmModal.value = true;
 } else if (action === 'Approved') {
 confirmTitle.value = 'Approve Application';
 confirmMessage.value = 'Are you sure you want to approve this application? The agent will be onboarded.';
 } else if (action === 'Rejected') {
 confirmTitle.value = 'Reject Application';
 confirmMessage.value = 'Are you sure you want to reject this application? This action cannot be undone.';
 showRejectModal.value = true;
 return;
 }
 showConfirmModal.value = true;
};

const confirmAction = () => {
 if (pendingAction.value === 'Rejected') {
 if (!rejectionReason.value.trim()) {
 addToast('Please provide a reason for rejection.', 'error');
 return;
 }
 currentStatus.value = 'Rejected';
 addToast('Application rejected.', 'warning');
 showConfirmModal.value = false;
 setTimeout(() => router.push('/dashboard/maker-checker'), 1000);
 return;
 }

 if (pendingAction.value === 'Recommended') {
 currentStatus.value = 'Recommended';
 addToast('Application Recommended by Team Lead. Forwarded to Internal Control.', 'success');
 showConfirmModal.value = false;
 setTimeout(() => router.push('/dashboard/maker-checker'), 1000);
 return;
 }

 if (pendingAction.value === 'Approved') {
 currentStatus.value = 'Approved';
 addToast('Application Approved successfully!', 'success');
 showConfirmModal.value = false;
 setTimeout(() => router.push('/dashboard/maker-checker'), 1000);
 }
};
</script>
