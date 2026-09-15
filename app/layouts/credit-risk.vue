<template>
  <div class="h-screen overflow-hidden bg-slate-50 font-sans flex text-slate-800">
    <!-- Sidebar -->
    <aside :class="[
      'bg-white border-r border-slate-200 flex-shrink-0 flex flex-col z-40 transition-all duration-300 relative',
      isSidebarMinimized ? 'w-20' : 'w-64'
    ]">
      <!-- Sidebar Shrink Toggle -->
      <button @click="isSidebarMinimized = !isSidebarMinimized"
          class="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 items-center justify-center w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-600 transition-all shadow-sm z-50"
          :title="isSidebarMinimized ? 'Expand Sidebar' : 'Collapse Sidebar'">
          <svg v-if="!isSidebarMinimized" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
      </button>

      <!-- Logo Area -->
      <div class="h-20 flex items-center border-b border-transparent"
           :class="isSidebarMinimized ? 'justify-center px-4' : 'px-6'">
         <img src="@/assets/img/logo.png" class="h-6 w-auto" v-if="!isSidebarMinimized" />
      </div>
      
      <!-- Navigation -->
      <div class="px-4 py-6 space-y-1 overflow-y-auto flex-1" :class="isSidebarMinimized ? 'px-2' : 'px-4'">
        <NuxtLink to="/credit-risk/broadsheet" class="flex items-center gap-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group" :class="[isSidebarMinimized ? 'justify-center px-0' : 'px-3', route.path === '/credit-risk/broadsheet' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900']" :title="isSidebarMinimized ? 'Broadsheet and Repayment' : ''">
          <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
          <span v-if="!isSidebarMinimized">Broadsheet and Repayment</span>
        </NuxtLink>

        <NuxtLink to="/credit-risk/agent-recruitment" class="flex items-center gap-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group" :class="[isSidebarMinimized ? 'justify-center px-0' : 'px-3', route.path === '/credit-risk/agent-recruitment' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900']" :title="isSidebarMinimized ? 'Agent Recruitment' : ''">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          <span v-if="!isSidebarMinimized">Agent Recruitment</span>
        </NuxtLink>

        <NuxtLink to="/credit-risk/agent-management" class="flex items-center gap-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group" :class="[isSidebarMinimized ? 'justify-center px-0' : 'px-3', route.path === '/credit-risk/agent-management' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900']" :title="isSidebarMinimized ? 'Agent Management' : ''">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          <span v-if="!isSidebarMinimized">Agent Management</span>
        </NuxtLink>

        <NuxtLink to="/credit-risk/customer-management" class="flex items-center gap-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group" :class="[isSidebarMinimized ? 'justify-center px-0' : 'px-3', route.path === '/credit-risk/customer-management' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900']" :title="isSidebarMinimized ? 'Customer Management' : ''">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
          <span v-if="!isSidebarMinimized">Customer Management</span>
        </NuxtLink>

        <NuxtLink to="/credit-risk/reports" class="flex items-center gap-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group" :class="[isSidebarMinimized ? 'justify-center px-0' : 'px-3', route.path === '/credit-risk/reports' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900']" :title="isSidebarMinimized ? 'Report' : ''">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          <span v-if="!isSidebarMinimized">Report</span>
        </NuxtLink>

        <NuxtLink to="/credit-risk/role-management" class="flex items-center gap-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group" :class="[isSidebarMinimized ? 'justify-center px-0' : 'px-3', route.path === '/credit-risk/role-management' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900']" :title="isSidebarMinimized ? 'Role management' : ''">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          <span v-if="!isSidebarMinimized">Role management</span>
        </NuxtLink>
      </div>

      <!-- Footer Action -->
      <div class="p-4 border-t border-slate-100 mt-auto">
          <NuxtLink to="/dashboard"
              class="flex items-center gap-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
              :class="isSidebarMinimized ? 'justify-center px-0' : 'px-3'"
              :title="isSidebarMinimized ? 'Back to Dashboard' : ''">
              <svg class="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              <span v-if="!isSidebarMinimized" class="whitespace-nowrap">Back to Dashboard</span>
          </NuxtLink>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 transition-all duration-300 overflow-hidden">
      <!-- Header -->
      <header class="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20">
        <h1 class="text-[20px] font-semibold text-slate-800 whitespace-nowrap">{{ pageTitle }}</h1>
        
        <div class="flex items-center gap-4 shrink-0 relative" ref="profileDropdownRef">
          <button @click="isProfileDropdownOpen = !isProfileDropdownOpen" class="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-lg transition-colors cursor-pointer text-left">
            <div class="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-medium">
              BM
            </div>
            <div class="hidden sm:flex flex-col">
              <span class="text-[13px] font-medium text-slate-900 leading-tight">Darmian Moses</span>
              <span class="text-[11px] text-slate-400">Credit Risk</span>
            </div>
            <div class="text-slate-400 hover:text-slate-600 transition-colors ml-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </button>
          
          <div v-if="isProfileDropdownOpen" class="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
            <div class="px-4 py-2 border-b border-slate-100 mb-1">
              <div class="text-sm font-medium text-slate-800">Darmian Moses</div>
              <div class="text-xs text-slate-500">darmian@example.com</div>
            </div>
            <button class="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              Profile Settings
            </button>
            <button @click="triggerLogout" class="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              Sign out
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
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const isSidebarMinimized = ref(false);

const isProfileDropdownOpen = ref(false);
const profileDropdownRef = ref(null);

const closeProfileDropdown = (e) => {
  if (profileDropdownRef.value && !profileDropdownRef.value.contains(e.target)) {
    isProfileDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeProfileDropdown);
});

onUnmounted(() => {
  document.removeEventListener('click', closeProfileDropdown);
});

const triggerLogout = () => {
  router.push('/login');
};

const pageTitle = computed(() => {
  if (route.path === '/credit-risk/broadsheet') return 'Broadsheet & Repayment Schedule';
  if (route.path === '/credit-risk/reports') return 'Reports';
  return 'Credit Risk';
});
</script>
