<template>
 <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
 <TransitionGroup name="toast">
 <div v-for="toast in toasts" :key="toast.id" 
 class="pointer-events-auto bg-white border rounded-xl p-4 flex items-start gap-3 shadow-sm min-w-[300px] max-w-sm"
 :class="{
 'border-emerald-200': toast.type === 'success',
 'border-rose-200': toast.type === 'error',
 'border-amber-200': toast.type === 'warning',
 'border-slate-200': toast.type === 'info'
 }">
 <div class="mt-0.5 shrink-0">
 <svg v-if="toast.type === 'success'" class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
 <svg v-else-if="toast.type === 'error'" class="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
 <svg v-else-if="toast.type === 'warning'" class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
 <svg v-else class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
 </div>
 <div class="flex-1">
 <p class="text-sm text-slate-800">{{ toast.message }}</p>
 </div>
 <button @click="removeToast(toast.id)" class="text-slate-400 hover:text-slate-600 transition-colors shrink-0">
 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
 </button>
 </div>
 </TransitionGroup>
 </div>
</template>

<script setup>
import { useToast } from '@/composables/useToast';

const { toasts, removeToast } = useToast();
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
 transition: all 0.3s ease;
}
.toast-enter-from {
 opacity: 0;
 transform: translateX(30px);
}
.toast-leave-to {
 opacity: 0;
 transform: translateX(30px) scale(0.9);
}
</style>
