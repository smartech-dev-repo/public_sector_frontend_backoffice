<template>
 <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
 <div class="max-w-md w-full">
 <div class="bg-white p-8 rounded-3xl border border-slate-200 text-center">
 <div class="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center mb-6">
 <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
 </div>
 <h2 class="text-3xl text-slate-900">Admin Portal</h2>
 <p class="mt-2 text-sm text-slate-500 mb-8">Sign in to the Maker/Checker queue.</p>

 <form class="space-y-4 text-left mt-6" @submit.prevent="handleLogin">
 <UiCustomInput
 v-model="email"
 label="Email Address"
 type="email"
 placeholder="admin@test.com"
 required
 />
 <UiCustomInput
 v-model="password"
 label="Password"
 type="password"
 placeholder="Enter password"
 required
 />
 
 <button type="submit" class="w-full py-3.5 px-4 rounded-xl text-white bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 transition-all">
 Secure Login
 </button>
 </form>
 </div>
 </div>
 </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

definePageMeta({
 layout: false
});

const router = useRouter();
const email = ref('admin@test.com');
const password = ref('Testadmin123!');

const handleLogin = () => {
 router.push('/dashboard');
};
</script>
