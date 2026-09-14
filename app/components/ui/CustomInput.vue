<template>
 <div class="w-full" :class="containerClass">
 <!-- Label -->
 <label v-if="label" :for="inputId" class="block text-sm text-slate-700 mb-2 tracking-wide">
 {{ label }}
 <span v-if="required" class="text-red-500 ml-0.5">*</span>
 </label>

 <!-- Input Wrapper -->
 <div
 class="relative group"
 :class="{ 'opacity-60 pointer-events-none': disabled }"
 >
 <!-- Prefix Icon/Slot -->
 <div v-if="$slots.prefix || prefixIcon" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors duration-200 z-10">
 <slot name="prefix">
 <span v-if="prefixIcon" class="text-lg">{{ prefixIcon }}</span>
 </slot>
 </div>

 <!-- The Input -->
 <input
 v-if="type !== 'textarea'"
 :id="inputId"
 ref="inputRef"
 :type="computedType"
 :value="modelValue"
 :placeholder="placeholder"
 :disabled="disabled"
 :readonly="readonly"
 :required="required"
 :autocomplete="autocomplete"
 :maxlength="maxlength"
 class="peer w-full rounded-xl border bg-white px-4 py-3 text-[15px] font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal outline-none transition-all duration-200"
 :class="[ inputSizeClass, hasError ? 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:bg-white', ($slots.prefix || prefixIcon) ? 'pl-12' : '', ($slots.suffix || suffixIcon || type === 'password' || clearable) ? 'pr-12' : '', ]"
 @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
 @focus="isFocused = true"
 @blur="handleBlur"
 @keydown.enter="$emit('enter')"
 />

 <!-- Textarea Variant -->
 <textarea
 v-else
 :id="inputId"
 ref="inputRef"
 :value="modelValue"
 :placeholder="placeholder"
 :disabled="disabled"
 :readonly="readonly"
 :required="required"
 :rows="rows"
 :maxlength="maxlength"
 class="peer w-full rounded-xl border bg-white px-4 py-3 text-[15px] font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal outline-none transition-all duration-200 resize-none"
 :class="[ hasError ? 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:bg-white', ]"
 @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
 @focus="isFocused = true"
 @blur="handleBlur"
 />

 <!-- Suffix Actions -->
 <div v-if="$slots.suffix || suffixIcon || type === 'password' || (clearable && modelValue)" class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
 <!-- Clear button -->
 <button
 v-if="clearable && modelValue"
 type="button"
 class="w-5 h-5 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-slate-500 hover:text-slate-700 transition-all duration-150"
 @click="$emit('update:modelValue', ''); $emit('clear')"
 >
 <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
 </button>

 <!-- Password toggle -->
 <button
 v-if="type === 'password'"
 type="button"
 class="text-slate-400 hover:text-emerald-600 transition-colors duration-200"
 @click="showPassword = !showPassword"
 >
 <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
 <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
 </button>

 <!-- Custom suffix -->
 <slot name="suffix">
 <span v-if="suffixIcon" class="text-slate-400 text-lg">{{ suffixIcon }}</span>
 </slot>
 </div>


 </div>

 <!-- Bottom Row: Error / Hint / Character Count -->
 <div v-if="hasError || hint || (maxlength && showCount)" class="flex items-start justify-between mt-1">
 <div class="flex-1">
 <p v-if="hasError && errorMessage" class="text-xs font-medium text-red-500 flex items-center gap-1">
 <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
 {{ errorMessage }}
 </p>
 <p v-else-if="hint" class="text-xs text-slate-400">{{ hint }}</p>
 </div>
 <span v-if="maxlength && showCount" class="text-xs text-slate-400 ml-2 tabular-nums">
 {{ (modelValue || '').length }}/{{ maxlength }}
 </span>
 </div>
 </div>
</template>

<script setup lang="ts">
import { ref, computed, useId } from 'vue';

const props = defineProps({
 modelValue: { type: [String, Number], default: '' },
 label: { type: String, default: '' },
 placeholder: { type: String, default: '' },
 type: { type: String, default: 'text' },
 disabled: { type: Boolean, default: false },
 readonly: { type: Boolean, default: false },
 required: { type: Boolean, default: false },
 clearable: { type: Boolean, default: false },
 hasError: { type: Boolean, default: false },
 errorMessage: { type: String, default: '' },
 hint: { type: String, default: '' },
 prefixIcon: { type: String, default: '' },
 suffixIcon: { type: String, default: '' },
 autocomplete: { type: String, default: 'off' },
 maxlength: { type: [Number, String], default: undefined },
 showCount: { type: Boolean, default: false },
 rows: { type: Number, default: 4 },
 size: { type: String, default: 'md' }, // 'sm' | 'md' | 'lg'
 containerClass: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue', 'enter', 'clear', 'blur']);

const inputId = `input-${useId()}`;
const inputRef = ref<HTMLInputElement | HTMLTextAreaElement | null>(null);
const isFocused = ref(false);
const showPassword = ref(false);

const computedType = computed(() => {
 if (props.type === 'password') return showPassword.value ? 'text' : 'password';
 return props.type;
});

const inputSizeClass = computed(() => {
 switch (props.size) {
 case 'sm': return 'py-2.5 text-sm';
 case 'lg': return 'py-4.5 text-base';
 default: return 'py-3.5 text-[15px]';
 }
});

const handleBlur = (e: FocusEvent) => {
 isFocused.value = false;
 emit('blur', e);
};

const focus = () => inputRef.value?.focus();

defineExpose({ focus, inputRef });
</script>
