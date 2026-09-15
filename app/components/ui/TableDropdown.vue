<template>
 <div ref="containerRef" class="inline-block">
 <button ref="buttonRef" @click="toggle" class="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors">
 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
 </button>
 
 <Teleport to="body">
 <Transition
 enter-active-class="transition duration-100 ease-out"
 enter-from-class="transform scale-95 opacity-0"
 enter-to-class="transform scale-100 opacity-100"
 leave-active-class="transition duration-75 ease-in"
 leave-from-class="transform scale-100 opacity-100"
 leave-to-class="transform scale-95 opacity-0"
 >
 <div v-if="isOpen" ref="menuRef" @click="isOpen = false" :style="dropdownStyle" class="fixed z-[9999] w-48 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden text-left flex flex-col py-1">
 <slot></slot>
 </div>
 </Transition>
 </Teleport>
 </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';

const isOpen = ref(false);
const containerRef = ref(null);
const buttonRef = ref(null);
const menuRef = ref(null);
const dropdownStyle = ref({ top: '0px', left: '0px' });
const uid = Math.random().toString(36).substring(2, 9);

const updatePosition = () => {
 if (!buttonRef.value || !isOpen.value || !menuRef.value) return;
 const rect = buttonRef.value.getBoundingClientRect();
 const menuHeight = menuRef.value.offsetHeight || 150;
 
 // Try to position below
 let top = rect.bottom + 4;
 let left = rect.right - 192; // 192 is w-48
 
 // Basic bounds checking (if it goes off screen bottom)
 if (top + menuHeight > window.innerHeight) {
 top = rect.top - menuHeight - 4; // render above
 }
 
 dropdownStyle.value = {
 top: `${top}px`,
 left: `${left}px`
 };
};

const toggle = async () => {
 if (!isOpen.value) {
   window.dispatchEvent(new CustomEvent('close-table-dropdowns', { detail: uid }));
 }
 isOpen.value = !isOpen.value;
 if (isOpen.value) {
 await nextTick();
 updatePosition();
 }
};

const handleClickOutside = (event) => {
 if (isOpen.value && containerRef.value && !containerRef.value.contains(event.target)) {
 if (menuRef.value && !menuRef.value.contains(event.target)) {
 isOpen.value = false;
 }
 }
};

const handleScroll = () => {
 if (isOpen.value) {
 updatePosition();
 }
};

const handleCloseDropdowns = (e) => {
  if (e.detail !== uid) {
    isOpen.value = false;
  }
};

onMounted(() => {
 document.addEventListener('click', handleClickOutside);
 window.addEventListener('scroll', handleScroll, true);
 window.addEventListener('resize', handleScroll);
 window.addEventListener('close-table-dropdowns', handleCloseDropdowns);
});
onUnmounted(() => {
 document.removeEventListener('click', handleClickOutside);
 window.removeEventListener('scroll', handleScroll, true);
 window.removeEventListener('resize', handleScroll);
 window.removeEventListener('close-table-dropdowns', handleCloseDropdowns);
});
</script>
