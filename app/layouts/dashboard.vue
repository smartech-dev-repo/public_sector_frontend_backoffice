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
                <!-- General Section -->
                <div>
                    <div v-if="!isSidebarMinimized" class="text-xs uppercase tracking-wider text-slate-500 mb-3">General
                    </div>
                    <nav class="space-y-2">
                        <NuxtLink to="/dashboard"
                            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all group"
                            exact-active-class="bg-emerald-600 text-white [&>svg]:text-white"
                            :title="isSidebarMinimized ? 'Overview' : ''">
                            <svg class="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z">
                                </path>
                            </svg>
                            <span v-if="!isSidebarMinimized" class="whitespace-nowrap">Platform Overview</span>
                        </NuxtLink>
                        <NuxtLink to="/dashboard/analytics"
                            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all group"
                            active-class="bg-emerald-600 text-white [&>svg]:text-white"
                            :title="isSidebarMinimized ? 'Analytics & Reports' : ''">
                            <svg class="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                                </path>
                            </svg>
                            <span v-if="!isSidebarMinimized" class="whitespace-nowrap">Analytics & Reports</span>
                        </NuxtLink>
                    </nav>
                </div>

                <!-- Portals Section -->
                <div class="mt-8">
                    <div v-if="!isSidebarMinimized" class="text-xs uppercase tracking-wider text-slate-500 mb-3">
                        Portals</div>
                    <nav class="space-y-2">
                        <NuxtLink to="/credit-risk/broadsheet"
                            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all group"
                            :title="isSidebarMinimized ? 'Credit Risk Portal' : ''">
                            <svg class="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z">
                                </path>
                            </svg>
                            <span v-if="!isSidebarMinimized" class="whitespace-nowrap">Credit Risk Portal</span>
                        </NuxtLink>
                    </nav>
                </div>

                <!-- Operations Section -->
                <div class="mt-8">
                    <div v-if="!isSidebarMinimized" class="text-xs uppercase tracking-wider text-slate-500 mb-3">
                        Operations</div>
                    <nav class="space-y-2">
                        <NuxtLink to="/dashboard/maker-checker"
                            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all group"
                            active-class="bg-emerald-600 text-white [&>svg]:text-white"
                            :title="isSidebarMinimized ? 'Maker/Checker Queue' : ''">
                            <svg class="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                </path>
                            </svg>
                            <span v-if="!isSidebarMinimized" class="whitespace-nowrap">Maker/Checker Queue</span>
                        </NuxtLink>
                        <NuxtLink to="/dashboard/exceptions"
                            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all group"
                            active-class="bg-emerald-600 text-white [&>svg]:text-white"
                            :title="isSidebarMinimized ? 'Exception Queue' : ''">
                            <svg class="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z">
                                </path>
                            </svg>
                            <span v-if="!isSidebarMinimized" class="whitespace-nowrap">Exception Queue</span>
                        </NuxtLink>
                        <NuxtLink to="/dashboard/uploads"
                            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all group"
                            active-class="bg-emerald-600 text-white [&>svg]:text-white"
                            :title="isSidebarMinimized ? 'Data Uploads' : ''">
                            <svg class="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12">
                                </path>
                            </svg>
                            <span v-if="!isSidebarMinimized" class="whitespace-nowrap">Data Uploads</span>
                        </NuxtLink>
                        <NuxtLink to="/dashboard/reconciliation"
                            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all group"
                            active-class="bg-emerald-600 text-white [&>svg]:text-white"
                            :title="isSidebarMinimized ? 'Reconciliation' : ''">
                            <svg class="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4">
                                </path>
                            </svg>
                            <span v-if="!isSidebarMinimized" class="whitespace-nowrap">Reconciliation</span>
                        </NuxtLink>
                    </nav>
                </div>

                <!-- Administration Section -->
                <div class="mt-8">
                    <div v-if="!isSidebarMinimized" class="text-xs uppercase tracking-wider text-slate-500 mb-3">
                        Administration</div>
                    <nav class="space-y-2">
                        <NuxtLink to="/dashboard/team"
                            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all group"
                            active-class="bg-emerald-600 text-white [&>svg]:text-white"
                            :title="isSidebarMinimized ? 'Team Management' : ''">
                            <svg class="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z">
                                </path>
                            </svg>
                            <span v-if="!isSidebarMinimized" class="whitespace-nowrap">Team Management</span>
                        </NuxtLink>
                        <NuxtLink to="/dashboard/admins"
                            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all group"
                            active-class="bg-emerald-600 text-white [&>svg]:text-white"
                            :title="isSidebarMinimized ? 'Admin Users' : ''">
                            <svg class="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z">
                                </path>
                            </svg>
                            <span v-if="!isSidebarMinimized" class="whitespace-nowrap">Admin Users</span>
                        </NuxtLink>
                        <NuxtLink to="/dashboard/roles"
                            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all group"
                            active-class="bg-emerald-600 text-white [&>svg]:text-white"
                            :title="isSidebarMinimized ? 'Roles' : ''">
                            <svg class="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                            <span v-if="!isSidebarMinimized" class="whitespace-nowrap">Roles</span>
                        </NuxtLink>
                        <NuxtLink to="/dashboard/permissions"
                            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all group"
                            active-class="bg-emerald-600 text-white [&>svg]:text-white"
                            :title="isSidebarMinimized ? 'Permissions' : ''">
                            <svg class="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
                            <span v-if="!isSidebarMinimized" class="whitespace-nowrap">Permissions</span>
                        </NuxtLink>
                        <NuxtLink to="/dashboard/invites"
                            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all group"
                            active-class="bg-emerald-600 text-white [&>svg]:text-white"
                            :title="isSidebarMinimized ? 'Invites' : ''">
                            <svg class="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5M10 12l2.25 1.5M14 12l-2.25 1.5"></path></svg>
                            <span v-if="!isSidebarMinimized" class="whitespace-nowrap">Invites</span>
                        </NuxtLink>
                        <NuxtLink to="/dashboard/agent-security"
                            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all group"
                            active-class="bg-emerald-600 text-white [&>svg]:text-white"
                            :title="isSidebarMinimized ? 'Agent Security' : ''">
                            <svg class="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z">
                                </path>
                            </svg>
                            <span v-if="!isSidebarMinimized" class="whitespace-nowrap">Agent Security</span>
                        </NuxtLink>
                        <NuxtLink to="/dashboard/audit"
                            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all group"
                            active-class="bg-emerald-600 text-white [&>svg]:text-white"
                            :title="isSidebarMinimized ? 'Audit Trail (Mock)' : ''">
                            <svg class="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z">
                                </path>
                            </svg>
                            <span v-if="!isSidebarMinimized" class="whitespace-nowrap">Audit Trail (Mock)</span>
                        </NuxtLink>
                        <NuxtLink to="/dashboard/audit-logs"
                            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all group"
                            active-class="bg-emerald-600 text-white [&>svg]:text-white"
                            :title="isSidebarMinimized ? 'Audit Logs (API)' : ''">
                            <svg class="w-5 h-5 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                            <span v-if="!isSidebarMinimized" class="whitespace-nowrap">Audit Logs (API)</span>
                        </NuxtLink>
                    </nav>
                </div>
            </div>
            <div class="p-4 border-t border-slate-800 flex flex-col gap-2">
                <button @click="triggerLogout"
                    class="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all group"
                    :title="isSidebarMinimized ? 'Logout' : ''">
                    <svg class="w-5 h-5 shrink-0 text-slate-400 group-hover:text-rose-500 transition-colors" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1">
                        </path>
                    </svg>
                    <span v-if="!isSidebarMinimized" class="whitespace-nowrap">Logout</span>
                </button>
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
                    <button @click="toggleTheme" class="p-2 text-slate-400 hover:text-emerald-500 hover:bg-slate-50 rounded-lg transition-colors" :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
                        <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                    </button>
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
import { useTheme } from '@/composables/core/useTheme';

const route = useRoute();
const router = useRouter();
const { isDark, toggleTheme, initTheme } = useTheme();

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
  initTheme();
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
