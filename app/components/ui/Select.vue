<template>
 <div class="relative" ref="selectContainer">
 <label v-if="label" class="block text-sm text-slate-700 mb-1.5">{{ label }}</label>
 <div class="relative flex items-center" @click="isOpen = !isOpen">
 <div v-if="$slots.icon" class="absolute left-3 text-slate-400 pointer-events-none">
 <slot name="icon"></slot>
 </div>
 <div 
 :class="[
 'w-full bg-slate-50 border rounded-xl py-2.5 text-sm outline-none transition-all cursor-pointer flex items-center justify-between',
 isOpen ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/20' : 'border-slate-200',
 $slots.icon ? 'pl-10 pr-10' : 'pl-4 pr-10',
 selectedOption ? 'text-slate-800' : 'text-slate-400'
 ]"
 >
 <span>{{ selectedOption ? selectedOption.label : (placeholder || 'Select...') }}</span>
 <div class="absolute right-3 text-slate-400 pointer-events-none transition-transform duration-200" :class="{ 'rotate-180': isOpen }">
 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
 </div>
 </div>
 </div>

 <!-- Dropdown Menu -->
 <Transition
 enter-active-class="transition duration-100 ease-out"
 enter-from-class="transform scale-95 opacity-0"
 enter-to-class="transform scale-100 opacity-100"
 leave-active-class="transition duration-75 ease-in"
 leave-from-class="transform scale-100 opacity-100"
 leave-to-class="transform scale-95 opacity-0"
 >
 <div v-if="isOpen" class="absolute z-50 w-full mt-2 origin-top-right bg-white border border-slate-100 rounded-xl shadow-xl outline-none overflow-hidden max-h-60 overflow-y-auto">
 <div class="py-1">
 <div v-if="placeholder" class="px-4 py-2 text-sm text-slate-400 cursor-default">
 {{ placeholder }}
 </div>
 <button 
 v-for="opt in options" 
 :key="opt.value" 
 @click="selectOption(opt.value)"
 class="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between"
 :class="opt.value === modelValue ? 'bg-emerald-50/50 text-emerald-700 font-medium' : 'text-slate-700 hover:bg-slate-50'"
 >
 {{ opt.label }}
 <svg v-if="opt.value === modelValue" class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
 </button>
 </div>
 </div>
 </Transition>
 </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
 modelValue: {
 type: [String, Number],
 default: ''
 },
 label: {
 type: String,
 default: ''
 },
 options: {
 type: Array,
 required: true
 },
 placeholder: {
 type: String,
 default: ''
 }
});

const emit = defineEmits(['update:modelValue']);
const isOpen = ref(false);
const selectContainer = ref(null);

const selectedOption = computed(() => {
 return props.options.find(opt => opt.value === props.modelValue) || null;
});

const selectOption = (value) => {
 emit('update:modelValue', value);
 isOpen.value = false;
};

const handleClickOutside = (event) => {
 if (selectContainer.value && !selectContainer.value.contains(event.target)) {
 isOpen.value = false;
 }
};

onMounted(() => {
 document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
 document.removeEventListener('click', handleClickOutside);
});
</script>
