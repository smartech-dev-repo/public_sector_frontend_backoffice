<template>
  <div class="relative w-full">
    <flat-pickr
      v-model="internalValue"
      :config="config"
      class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors shadow-sm cursor-pointer placeholder-slate-400 pl-9"
      :placeholder="placeholder"
    />
    <div class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
      <Calendar class="w-4 h-4" />
    </div>
    <!-- Clear button -->
    <button 
      v-if="internalValue" 
      @click="clearDate"
      class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
    >
      <X class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import FlatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';
import { Calendar, X } from 'lucide-vue-next';

const props = defineProps({
  modelValue: {
    type: [String, Date, Array],
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Select date range...'
  },
  mode: {
    type: String,
    default: 'range' // 'single', 'multiple', or 'range'
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val);
    emit('change', val);
  }
});

const config = ref({
  mode: props.mode,
  dateFormat: 'd M Y',
  altInput: true,
  altFormat: 'd M Y',
  allowInput: false,
});

const clearDate = () => {
  internalValue.value = '';
};
</script>

<style>
/* Optional custom styling for flatpickr to match the theme */
.flatpickr-day.selected, .flatpickr-day.startRange, .flatpickr-day.endRange, .flatpickr-day.selected.inRange, .flatpickr-day.startRange.inRange, .flatpickr-day.endRange.inRange, .flatpickr-day.selected:focus, .flatpickr-day.startRange:focus, .flatpickr-day.endRange:focus, .flatpickr-day.selected:hover, .flatpickr-day.startRange:hover, .flatpickr-day.endRange:hover, .flatpickr-day.selected.prevMonthDay, .flatpickr-day.startRange.prevMonthDay, .flatpickr-day.endRange.prevMonthDay, .flatpickr-day.selected.nextMonthDay, .flatpickr-day.startRange.nextMonthDay, .flatpickr-day.endRange.nextMonthDay {
    background: #059669; /* emerald-600 */
    border-color: #059669;
}
</style>
