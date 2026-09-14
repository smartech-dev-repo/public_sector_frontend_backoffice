<template>
  <div class="space-y-6 pb-12">
    <!-- Breadcrumb -->
    <div class="text-sm">
      <NuxtLink to="/credit-risk/agent-management" class="text-slate-400 hover:text-slate-600 transition-colors">Agent management</NuxtLink>
      <span class="text-slate-400 mx-2">/</span>
      <span class="text-slate-900 font-medium">Agent details</span>
    </div>

    <!-- Agent Details Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-2">
      <div>
        <p class="text-[12px] text-slate-400 mb-1">Name</p>
        <p class="text-[16px] font-semibold text-slate-900">Chukwuemeka Ibe</p>
      </div>
      <div>
        <p class="text-[12px] text-slate-400 mb-1">Phone</p>
        <p class="text-[16px] font-semibold text-slate-900">08031234821</p>
      </div>
      <div>
        <p class="text-[12px] text-slate-400 mb-1">Bvn</p>
        <p class="text-[16px] font-semibold text-slate-900">123456784821</p>
      </div>
      <div>
        <p class="text-[12px] text-slate-400 mb-1">Nin</p>
        <p class="text-[16px] font-semibold text-slate-900">1234567890</p>
      </div>
      <div>
        <p class="text-[12px] text-slate-400 mb-1">Gender</p>
        <p class="text-[16px] font-semibold text-slate-900">Male</p>
      </div>
      <div>
        <p class="text-[12px] text-slate-400 mb-1">Nationality</p>
        <p class="text-[16px] font-semibold text-slate-900">Nigerian</p>
      </div>
      <div class="md:col-span-2">
        <p class="text-[12px] text-slate-400 mb-1">Address</p>
        <p class="text-[16px] font-semibold text-slate-900">14 Adeniran Ogunsanya St, Surulere, Lagos</p>
        
        <!-- Assignee Tag -->
        <div class="mt-4 inline-flex items-center gap-3 bg-emerald-50/50 border border-emerald-100 rounded-xl p-2.5">
          <div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold">
            WA
          </div>
          <div class="flex flex-col pr-4">
            <span class="text-[13px] font-medium text-slate-900 leading-tight">Fawwaz Ali-Balogun</span>
            <span class="text-[10px] text-slate-500">f.bakare@moneyfield.ng &nbsp;&bull;&nbsp; 07012345678</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
      <div class="bg-slate-50 rounded-xl p-5 border border-slate-100">
        <h3 class="text-[13px] text-slate-500 font-medium mb-2">Agents pending full approval</h3>
        <div class="text-3xl font-bold text-emerald-600 mb-1">31</div>
      </div>
      <div class="bg-slate-50 rounded-xl p-5 border border-slate-100">
        <h3 class="text-[13px] text-slate-500 font-medium mb-2">Customers onboarded</h3>
        <div class="text-3xl font-bold text-emerald-600 mb-1">31</div>
      </div>
      <div class="bg-slate-50 rounded-xl p-5 border border-slate-100">
        <h3 class="text-[13px] text-slate-500 font-medium mb-2">Active agents</h3>
        <div class="text-3xl font-bold text-emerald-600 mb-1">31</div>
      </div>
    </div>

    <!-- Table Actions -->
    <div class="flex items-center justify-end gap-3 pt-4">
      <span class="text-sm text-slate-400 mr-2">Showing 10 of 10</span>
      <button class="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
        Filter
      </button>
      <button class="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        Export as .xlsx
      </button>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mt-4">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-[#EAF5F0]">
            <tr>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Name</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">IPPIS NO.</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Agent</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Sector</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Loan Amt</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Date</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="i in 8" :key="i" class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-6 py-4 font-medium text-slate-900">Adaeze Nwosu</td>
              <td class="px-6 py-4 text-slate-600">23598720984</td>
              <td class="px-6 py-4 font-medium text-slate-900">Ibrahim Sani</td>
              <td class="px-6 py-4 text-slate-600">Fed. Min. Agric</td>
              <td class="px-6 py-4 font-semibold text-slate-900">&#8358;2,000,000</td>
              <td class="px-6 py-4 text-slate-600">16 Aug 2026</td>
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
  </div>
</template>

<script setup>
import { computed } from 'vue';

definePageMeta({
  layout: 'credit-risk'
});
</script>
