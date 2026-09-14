<template>
 <Teleport to="body">
 <div v-if="modelValue" class="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
 <!-- Backdrop -->
 <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="closeModal"></div>

 <!-- Modal Content -->
 <div class="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
 
 <!-- Search Input Header -->
 <div class="flex items-center px-4 py-3 border-b border-slate-100">
 <svg class="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
 </svg>
 <input 
 ref="searchInput"
 type="text" 
 v-model="searchQuery" 
 placeholder="Search loans, agents, logs..." 
 class="flex-1 bg-transparent border-none outline-none px-4 py-2 text-slate-800 placeholder:text-slate-400 font-medium text-lg"
 @keydown.esc="closeModal"
 />
 <div class="flex items-center gap-2">
 <span class="text-xs text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 bg-slate-50">ESC</span>
 <button @click="closeModal" class="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
 </svg>
 </button>
 </div>
 </div>

 <!-- Search Results Body -->
 <div class="max-h-[60vh] overflow-y-auto p-4 bg-slate-50/50">
 
 <!-- Empty State -->
 <div v-if="!searchQuery" class="text-center py-12">
 <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
 <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
 </div>
 <p class="text-slate-500 font-medium">Type to start searching across the portal.</p>
 </div>

 <!-- Mock Results -->
 <div v-else class="space-y-6">
 <!-- Loan Results -->
 <div>
 <h3 class="text-xs text-slate-400 uppercase tracking-wider mb-3 px-2">Loan Applications (2)</h3>
 <div class="space-y-1">
 <button class="w-full flex items-center justify-between px-3 py-3 hover:bg-emerald-50 rounded-xl group transition-colors text-left border border-transparent hover:border-emerald-100">
 <div>
 <div class="text-slate-700 group-hover:text-emerald-700">Emmanuel Doe</div>
 <div class="text-xs text-slate-500 font-mono mt-0.5">APP-1001 • Pending Review</div>
 </div>
 <svg class="w-4 h-4 text-slate-300 group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
 </button>
 <button class="w-full flex items-center justify-between px-3 py-3 hover:bg-emerald-50 rounded-xl group transition-colors text-left border border-transparent hover:border-emerald-100">
 <div>
 <div class="text-slate-700 group-hover:text-emerald-700">Aisha Bello</div>
 <div class="text-xs text-slate-500 font-mono mt-0.5">APP-1002 • Approved</div>
 </div>
 <svg class="w-4 h-4 text-slate-300 group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
 </button>
 </div>
 </div>

 <!-- Agent Results -->
 <div>
 <h3 class="text-xs text-slate-400 uppercase tracking-wider mb-3 px-2">Agents (1)</h3>
 <div class="space-y-1">
 <button class="w-full flex items-center justify-between px-3 py-3 hover:bg-emerald-50 rounded-xl group transition-colors text-left border border-transparent hover:border-emerald-100">
 <div>
 <div class="text-slate-700 group-hover:text-emerald-700">John Doe</div>
 <div class="text-xs text-slate-500 font-mono mt-0.5">AGT-9901 • Suspended</div>
 </div>
 <svg class="w-4 h-4 text-slate-300 group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
 </button>
 </div>
 </div>
 </div>

 </div>
 </div>
 </div>
 </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
 modelValue: {
 type: Boolean,
 required: true
 }
});

const emit = defineEmits(['update:modelValue']);
const searchInput = ref(null);
const searchQuery = ref('');

watch(() => props.modelValue, (newVal) => {
 if (newVal) {
 searchQuery.value = '';
 // Focus input on open
 nextTick(() => {
 if (searchInput.value) {
 searchInput.value.focus();
 }
 });
 }
});

const closeModal = () => {
 emit('update:modelValue', false);
};
</script>
