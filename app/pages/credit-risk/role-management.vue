<template>
  <div class="space-y-6 relative h-full">
    <!-- Actions -->
    <div class="flex items-center justify-end gap-3">
      <span class="text-sm text-slate-400 mr-2">Showing 10 of 10</span>
      <button class="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
        Filter
      </button>
      <button @click="openModal" class="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 rounded-lg text-sm font-medium text-white hover:bg-emerald-700 transition-colors shadow-sm ml-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        Invite Member
      </button>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-[#EAF5F0]">
            <tr>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Name</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Department</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Email</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Date</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Role</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <!-- Row 1 -->
            <tr class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-6 py-4 font-medium text-slate-900">Adaeze Nwosu</td>
              <td class="px-6 py-4 text-slate-600">Credit and Risk</td>
              <td class="px-6 py-4 text-slate-600">a.nwosu@moneyfieldmfb.com</td>
              <td class="px-6 py-4 text-slate-600">16 Aug 2026</td>
              <td class="px-6 py-4 text-slate-900 font-medium">Credit Risk</td>
              <td class="px-6 py-4">
                <button class="font-medium text-slate-900 hover:text-emerald-600 transition-colors">
                  View
                </button>
              </td>
            </tr>
            <!-- Row 2 -->
            <tr class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-6 py-4 font-medium text-slate-900">Adaeze Nwosu</td>
              <td class="px-6 py-4 text-slate-600">Public Sector</td>
              <td class="px-6 py-4 text-slate-600">a.nwosu@moneyfieldmfb.com</td>
              <td class="px-6 py-4 text-slate-600">16 Aug 2026</td>
              <td class="px-6 py-4 text-slate-900 font-medium">Back Office</td>
              <td class="px-6 py-4">
                <button class="font-medium text-slate-900 hover:text-emerald-600 transition-colors">
                  View
                </button>
              </td>
            </tr>
            <!-- Row 3 -->
            <tr class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-6 py-4 font-medium text-slate-900">Adaeze Nwosu</td>
              <td class="px-6 py-4 text-slate-600">Credit and Risk</td>
              <td class="px-6 py-4 text-slate-600">a.nwosu@moneyfieldmfb.com</td>
              <td class="px-6 py-4 text-slate-600">16 Aug 2026</td>
              <td class="px-6 py-4 text-slate-900 font-medium">Credit Risk</td>
              <td class="px-6 py-4">
                <button class="font-medium text-slate-900 hover:text-emerald-600 transition-colors">
                  View
                </button>
              </td>
            </tr>
            <!-- Row 4 -->
            <tr class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-6 py-4 font-medium text-slate-900">Adaeze Nwosu</td>
              <td class="px-6 py-4 text-slate-600">Credit and Risk</td>
              <td class="px-6 py-4 text-slate-600">a.nwosu@moneyfieldmfb.com</td>
              <td class="px-6 py-4 text-slate-600">16 Aug 2026</td>
              <td class="px-6 py-4 text-slate-900 font-medium">Credit Risk</td>
              <td class="px-6 py-4">
                <button class="font-medium text-slate-900 hover:text-emerald-600 transition-colors">
                  View
                </button>
              </td>
            </tr>
            <!-- Row 5 -->
            <tr class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-6 py-4 font-medium text-slate-900">Adaeze Nwosu</td>
              <td class="px-6 py-4 text-slate-600">Credit and Risk</td>
              <td class="px-6 py-4 text-slate-600">a.nwosu@moneyfieldmfb.com</td>
              <td class="px-6 py-4 text-slate-600">16 Aug 2026</td>
              <td class="px-6 py-4 text-slate-900 font-medium">Credit Risk</td>
              <td class="px-6 py-4">
                <button class="font-medium text-slate-900 hover:text-emerald-600 transition-colors">
                  View
                </button>
              </td>
            </tr>
            <!-- Row 6 -->
            <tr class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-6 py-4 font-medium text-slate-900">Adaeze Nwosu</td>
              <td class="px-6 py-4 text-slate-600">Credit and Risk</td>
              <td class="px-6 py-4 text-slate-600">a.nwosu@moneyfieldmfb.com</td>
              <td class="px-6 py-4 text-slate-600">16 Aug 2026</td>
              <td class="px-6 py-4 text-slate-900 font-medium">Credit Risk</td>
              <td class="px-6 py-4">
                <button class="font-medium text-slate-900 hover:text-emerald-600 transition-colors">
                  View
                </button>
              </td>
            </tr>
            <!-- Row 7 -->
            <tr class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-6 py-4 font-medium text-slate-900">Adaeze Nwosu</td>
              <td class="px-6 py-4 text-slate-600">Credit and Risk</td>
              <td class="px-6 py-4 text-slate-600">a.nwosu@moneyfieldmfb.com</td>
              <td class="px-6 py-4 text-slate-600">16 Aug 2026</td>
              <td class="px-6 py-4 text-slate-900 font-medium">Credit Risk</td>
              <td class="px-6 py-4">
                <button class="font-medium text-slate-900 hover:text-emerald-600 transition-colors">
                  View
                </button>
              </td>
            </tr>
            <!-- Row 8 -->
            <tr class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-6 py-4 font-medium text-slate-900">Adaeze Nwosu</td>
              <td class="px-6 py-4 text-slate-600">Credit and Risk</td>
              <td class="px-6 py-4 text-slate-600">a.nwosu@moneyfieldmfb.com</td>
              <td class="px-6 py-4 text-slate-600">16 Aug 2026</td>
              <td class="px-6 py-4 text-slate-900 font-medium">Credit Risk</td>
              <td class="px-6 py-4">
                <button class="font-medium text-slate-900 hover:text-emerald-600 transition-colors">
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Invite Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="closeModal"></div>
      
      <div class="relative bg-white rounded-3xl shadow-xl w-full max-w-[440px] flex flex-col">
        <div class="p-8">
          <h2 class="text-xl font-semibold text-slate-900 mb-6">Invite Member</h2>
          
          <div class="space-y-4">
            <AuthInput label="Email" modelValue="w.uzoor@moneyfieldmfb.com" />
            
            <div class="flex flex-col gap-1.5">
              <label class="text-[12px] font-medium text-slate-500 ml-1">Role</label>
              <div class="relative">
                <select class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm appearance-none cursor-pointer">
                  <option value="" disabled selected>select</option>
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                </select>
                <!-- Custom chevron -->
                <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Modal Actions -->
          <div class="flex gap-4 pt-6 mt-2">
            <button @click="closeModal" class="px-6 py-3 rounded-xl border border-emerald-500 text-emerald-600 font-medium hover:bg-emerald-50 transition-colors shrink-0">
              Cancel
            </button>
            <button @click="closeModal" class="flex-1 py-3 px-6 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors">
              Proceed
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';

definePageMeta({
  layout: 'credit-risk'
});

const isModalOpen = ref(false);

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};
</script>
