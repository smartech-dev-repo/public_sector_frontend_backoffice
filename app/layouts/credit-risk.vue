<template>
    <div class="h-screen overflow-hidden bg-slate-50 font-sans flex text-slate-800">
        <!-- Global Components -->
        <UiToast />
        <UiSearchModal v-model="showSearchModal" />
        <UiModal v-model="showLogoutModal" title="Confirm Logout" @confirm="confirmLogout">
            Are you sure you want to securely log out of the Admin Portal?
        </UiModal>

        <!-- Mobile Sidebar Overlay -->
        <div v-if="isMobileSidebarOpen" @click="isMobileSidebarOpen = false"
            class="fixed inset-0 bg-slate-900/50 z-30 md:hidden backdrop-blur-sm transition-opacity"></div>

        <aside :class="[
            'bg-white border-r border-slate-200 text-slate-800 flex-shrink-0 flex flex-col z-40 transition-all duration-300 relative',
            'fixed inset-y-0 left-0 md:relative md:translate-x-0',
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
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

            <div class="h-16 flex items-center border-b border-transparent gap-3"
                :class="isSidebarMinimized ? 'justify-center px-4' : 'justify-center px-6'">
                <div class="flex items-center gap-3 overflow-hidden w-full" v-if="!isSidebarMinimized">
                    <div class="w-full flex items-center justify-center mb-6">
                        <NuxtLink to="/dashboard" class="flex items-center justify-center cursor-pointer w-full"><img src="@/assets/img/logo.png" class="h-6 w-auto" /></NuxtLink>
                    </div>
                </div>
            </div>
            <div class="p-6 space-y-8 flex-1 overflow-y-auto overflow-x-hidden">

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
</div>
        </aside>

        <div class="flex-1 flex flex-col min-w-0 transition-all duration-300">
            <header
                class="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
                <div class="flex items-center gap-3 sm:gap-8 flex-1">
                    <button @click="isMobileSidebarOpen = true"
                        class="md:hidden p-2 -ml-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                    <h1 class="text-xl text-slate-800 whitespace-nowrap">{{ pageTitle }}</h1>

                    <!-- Global Search Trigger -->
                    <div class="hidden max-w-md w-full relative sm:block">
                        <button @click="showSearchModal = true"
                            class="w-full flex items-center bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-full pl-4 pr-3 py-2 text-sm text-slate-500 outline-none transition-colors group">
                            <svg class="w-4 h-4 text-slate-400 mr-2 group-hover:text-emerald-500 transition-colors"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                            <span class="flex-1 text-left">Search loans, agents, audit logs...</span>
                            <kbd
                                class="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] text-slate-400 bg-white border border-slate-200 rounded-md">⌘K</kbd>
                        </button>
                    </div>
                </div>
                <div class="flex items-center gap-4 shrink-0 relative" ref="profileDropdownRef">
                    <button @click="isProfileDropdownOpen = !isProfileDropdownOpen" class="flex items-center gap-3 border-l border-slate-200 pl-4 hover:bg-slate-50 py-1.5 rounded-lg transition-colors cursor-pointer text-left">
                        <div class="w-9 h-9 rounded-full bg-slate-200 overflow-hidden border-2 border-white">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="User"
                                class="w-full h-full object-cover" />
                        </div>
                        <div class="hidden sm:block">
                            <div class="text-sm text-slate-700">Sarah Admin</div>
                            <div class="text-xs text-slate-500">Internal Control</div>
                        </div>
                        <div class="text-slate-400 hover:text-slate-600 transition-colors ml-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </button>
                    
                    <div v-if="isProfileDropdownOpen" class="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                        <div class="px-4 py-2 border-b border-slate-100 mb-1">
                          <div class="text-sm font-medium text-slate-800">Sarah Admin</div>
                          <div class="text-xs text-slate-500">sarah@example.com</div>
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

            <main class="flex-1 p-4 md:p-6 overflow-y-auto">
                <div class="max-w-7xl mx-auto">
                    <slot />
                </div>
            </main>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import UiToast from '@/components/ui/Toast.vue';
import UiModal from '@/components/ui/Modal.vue';
import UiSearchModal from '@/components/ui/SearchModal.vue';

const route = useRoute();
const router = useRouter();

const isSidebarMinimized = ref(false);
const isMobileSidebarOpen = ref(false);
const showLogoutModal = ref(false);
const showSearchModal = ref(false);

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

// Close mobile sidebar on route change
watch(() => route.fullPath, () => {
    isMobileSidebarOpen.value = false;
});

const pageTitle = computed(() => {
    if (route.path === '/dashboard') return 'Platform Overview';
    if (route.path.includes('/dashboard/maker-checker')) return 'Maker/Checker Queue';
    if (route.path.includes('/dashboard/agent-security')) return 'Agent Security & Suspension';
    if (route.path.includes('/dashboard/agent')) return 'Agent Application Details';
    if (route.path.includes('/dashboard/team')) return 'Team Management';
    if (route.path.includes('/dashboard/uploads')) return 'Credit Risk Uploads';
    if (route.path.includes('/dashboard/analytics')) return 'Analytics & Reports';
    if (route.path.includes('/dashboard/exceptions')) return 'Exception Queue';
    if (route.path.includes('/dashboard/reconciliation')) return 'Finance Reconciliation';
    if (route.path.includes('/dashboard/audit')) return 'Audit Trail Log';
    return 'Platform Overview';
});

const triggerLogout = () => {
    showLogoutModal.value = true;
};

const confirmLogout = () => {
    showLogoutModal.value = false;
    router.push('/login');
};
</script>
