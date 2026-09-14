<template>
 <Teleport to="body">
 <Transition name="modal">
 <div v-if="modelValue" class="fixed inset-0 z-[100] flex items-center justify-center">
 <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" @click="$emit('update:modelValue', false)"></div>
 
 <div class="relative bg-white rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl transform transition-all">
 <div class="flex items-start justify-between mb-4">
 <h3 class="text-xl text-slate-800">{{ title }}</h3>
 <button @click="$emit('update:modelValue', false)" class="text-slate-400 hover:text-slate-600 transition-colors">
 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
 </button>
 </div>
 
 <div class="text-slate-600 mb-6">
 <slot></slot>
 </div>
 
 <div class="flex items-center gap-3 justify-end">
 <button @click="$emit('update:modelValue', false)" class="px-5 py-2.5 rounded-xl text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">
 Cancel
 </button>
 <button @click="$emit('confirm')" class="px-5 py-2.5 rounded-xl text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
 Confirm
 </button>
 </div>
 </div>
 </div>
 </Transition>
 </Teleport>
</template>

<script setup>
defineProps({
 modelValue: {
 type: Boolean,
 required: true
 },
 title: {
 type: String,
 default: 'Confirm Action'
 }
});
defineEmits(['update:modelValue', 'confirm']);
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
 transition: all 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
 opacity: 0;
}
.modal-enter-from .relative,
.modal-leave-to .relative {
 transform: scale(0.95) translateY(10px);
}
</style>
