<template>
 <div class="relative">
 <label v-if="label" class="block text-sm text-slate-700 mb-1.5">{{ label }}</label>
 <div class="relative flex items-center">
 <div v-if="$slots.icon || type === 'money'" class="absolute left-3 text-slate-400 pointer-events-none">
 <slot name="icon">
 <span v-if="type === 'money'" class="text-sm font-medium">₦</span>
 </slot>
 </div>
 <input 
 :type="type === 'money' ? 'text' : type" 
 :value="formattedValue" 
 @input="handleInput"
 :placeholder="placeholder"
 :required="required"
 :class="[
 'w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-emerald-500 focus:bg-white',
 ($slots.icon || type === 'money') ? 'pl-8 pr-4' : 'px-4'
 ]"
 />
 </div>
 <p v-if="hint" class="mt-1.5 text-xs text-slate-500">{{ hint }}</p>
 </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
 modelValue: {
 type: [String, Number],
 default: ''
 },
 label: {
 type: String,
 default: ''
 },
 type: {
 type: String,
 default: 'text'
 },
 placeholder: {
 type: String,
 default: ''
 },
 hint: {
 type: String,
 default: ''
 },
 required: {
 type: Boolean,
 default: false
 }
});

const emit = defineEmits(['update:modelValue']);

const formattedValue = computed(() => {
 if (props.type === 'money' && props.modelValue) {
 const num = String(props.modelValue).replace(/\D/g, '');
 return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
 }
 return props.modelValue;
});

const handleInput = (event) => {
 let val = event.target.value;
 if (props.type === 'money') {
 val = val.replace(/\D/g, '');
 }
 emit('update:modelValue', val);
};
</script>
