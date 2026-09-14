<template>
  <div class="h-screen overflow-hidden bg-slate-50 font-sans flex text-slate-800">
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col z-40 transition-all duration-300">
      <!-- Logo Area -->
      <div class="h-20 flex items-center px-6 border-b border-transparent">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-bold leading-tight text-slate-900 tracking-wide">MONEYFIELD</span>
            <span class="text-[9px] font-medium leading-none text-slate-500">MICROFINANCE BANK LIMITED</span>
          </div>
        </div>
      </div>
      
      <!-- Navigation -->
      <div class="px-4 py-6 space-y-1 overflow-y-auto flex-1">
        <NuxtLink to="/credit-risk/broadsheet" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group" active-class="bg-emerald-600 text-white" :class="route.path === '/credit-risk/broadsheet' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'">
          <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
          <span>Broadsheet and Repayment</span>
        </NuxtLink>

        <NuxtLink to="/credit-risk/agent-recruitment" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group" active-class="bg-emerald-600 text-white" :class="route.path === '/credit-risk/agent-recruitment' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          <span>Agent Recruitment</span>
        </NuxtLink>

        <NuxtLink to="/credit-risk/agent-management" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group" active-class="bg-emerald-600 text-white" :class="route.path === '/credit-risk/agent-management' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          <span>Agent Management</span>
        </NuxtLink>

        <NuxtLink to="/credit-risk/customer-management" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group" active-class="bg-emerald-600 text-white" :class="route.path === '/credit-risk/customer-management' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
          <span>Customer Management</span>
        </NuxtLink>

        <NuxtLink to="/credit-risk/reports" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group" active-class="bg-emerald-600 text-white" :class="route.path === '/credit-risk/reports' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          <span>Report</span>
        </NuxtLink>

        <NuxtLink to="/credit-risk/role-management" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group" active-class="bg-emerald-600 text-white" :class="route.path === '/credit-risk/role-management' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          <span>Role management</span>
        </NuxtLink>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 transition-all duration-300 overflow-hidden">
      <!-- Header -->
      <header class="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20">
        <h1 class="text-[20px] font-semibold text-slate-800 whitespace-nowrap">{{ pageTitle }}</h1>
        
        <div class="flex items-center gap-4 shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-medium">
              BM
            </div>
            <div class="hidden sm:flex flex-col">
              <span class="text-[13px] font-medium text-slate-900 leading-tight">Darmian Moses</span>
              <span class="text-[11px] text-slate-400">Credit Risk</span>
            </div>
            <button class="text-slate-400 hover:text-slate-600 transition-colors ml-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
          </div>
        </div>
      </header>
      
      <!-- Page Content -->
      <main class="flex-1 p-6 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const pageTitle = computed(() => {
  if (route.path === '/credit-risk/broadsheet') return 'Broadsheet & Repayment Schedule';
  if (route.path === '/credit-risk/reports') return 'Reports';
  return 'Credit Risk';
});
</script>
