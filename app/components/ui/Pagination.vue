<template>
  <div class="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-white sm:px-6">
    <div class="flex flex-1 justify-between sm:hidden">
      <button 
        @click="prevPage" 
        :disabled="currentPage === 1"
        class="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <button 
        @click="nextPage" 
        :disabled="currentPage === totalPages || totalPages === 0"
        class="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-slate-700">
          Showing
          <span class="font-medium">{{ totalItems === 0 ? 0 : startIndex + 1 }}</span>
          to
          <span class="font-medium">{{ Math.min(endIndex, totalItems) }}</span>
          of
          <span class="font-medium">{{ totalItems }}</span>
          results
        </p>
      </div>
      <div class="flex items-center gap-4">
        <!-- Items per page selector -->
        <div class="flex items-center gap-2 relative" ref="dropdownRef">
          <label class="text-sm text-slate-600">Rows per page:</label>
          <button 
            @click="isDropdownOpen = !isDropdownOpen"
            class="flex items-center justify-between w-16 rounded-md border-0 py-1.5 pl-3 pr-2 text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600 sm:text-sm sm:leading-6 bg-white transition-colors cursor-pointer shadow-sm"
          >
            {{ itemsPerPage }}
            <svg class="h-4 w-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          
          <div v-if="isDropdownOpen" class="absolute bottom-full right-0 mb-1 w-16 rounded-md bg-white shadow-lg ring-1 ring-black/5 z-50 overflow-hidden py-1">
            <button
              v-for="option in [5, 10, 25, 50, 100]"
              :key="option"
              @click="updateItemsPerPage(option)"
              class="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
              :class="{ 'bg-emerald-50 text-emerald-700 font-medium': option === itemsPerPage }"
            >
              {{ option }}
            </button>
          </div>
        </div>

        <div>
          <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button 
              @click="prevPage"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="sr-only">Previous</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
              </svg>
            </button>
            
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :class="[
                page === currentPage 
                  ? 'relative z-10 inline-flex items-center bg-emerald-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600' 
                  : 'relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0'
              ]"
            >
              {{ page }}
            </button>
            
            <button 
              @click="nextPage"
              :disabled="currentPage === totalPages || totalPages === 0"
              class="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="sr-only">Next</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  totalItems: {
    type: Number,
    required: true
  },
  currentPage: {
    type: Number,
    required: true
  },
  itemsPerPage: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['update:currentPage', 'update:itemsPerPage']);

const isDropdownOpen = ref(false);
const dropdownRef = ref(null);

const closeDropdown = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
});

const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage));
const startIndex = computed(() => (props.currentPage - 1) * props.itemsPerPage);
const endIndex = computed(() => startIndex.value + props.itemsPerPage);

const visiblePages = computed(() => {
  if (totalPages.value === 0) return [1];
  const delta = 2;
  let start = Math.max(1, props.currentPage - delta);
  let end = Math.min(totalPages.value, props.currentPage + delta);

  if (props.currentPage - delta <= 1) {
    end = Math.min(totalPages.value, 1 + delta * 2);
  }
  if (props.currentPage + delta >= totalPages.value) {
    start = Math.max(1, totalPages.value - delta * 2);
  }

  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

const goToPage = (page) => {
  emit('update:currentPage', page);
};

const nextPage = () => {
  if (props.currentPage < totalPages.value) {
    emit('update:currentPage', props.currentPage + 1);
  }
};

const prevPage = () => {
  if (props.currentPage > 1) {
    emit('update:currentPage', props.currentPage - 1);
  }
};

const updateItemsPerPage = (value) => {
  emit('update:itemsPerPage', Number(value));
  emit('update:currentPage', 1); // Reset to first page when changing page size
  isDropdownOpen.value = false;
};
</script>
