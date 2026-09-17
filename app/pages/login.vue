<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
    <div class="max-w-[400px] w-full">
      <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
        <!-- Logo placeholder -->
         <div class="mx-auto rounded-lg flex items-center justify-center mb-6">
          <img src="@/assets/img/logo.png" class="h-6 w-auto" />
        </div>
        
        <h2 class="text-2xl font-semibold text-slate-900">Welcome back</h2>
        <p class="mt-2 text-sm text-slate-500 mb-8">Enter your Login details to access your dashboard</p>

        <form class="space-y-4 text-left" @submit.prevent="handleLogin">
          <AuthInput
            v-model="email"
            label="Enter your email"
            type="email"
            placeholder="example@mmfb.com"
            required
          />
          <AuthInput
            v-model="password"
            label="Enter your password"
            type="password"
            placeholder="!@#$%^&*(password)"
            required
          />
          
          <button :disabled="loading" type="submit" class="w-full flex justify-center items-center mt-2 py-3 px-4 rounded-xl text-white font-medium bg-emerald-500 hover:bg-emerald-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
            <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <div class="mt-6 text-sm text-slate-600">
          Forgot password? <NuxtLink to="/forgot-password" class="text-emerald-600 hover:underline font-medium">Reset password</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '~/composables/core/useAuth';

definePageMeta({
  layout: false
});

const router = useRouter();
const { adminLogin, loading, error } = useAuth();
const email = ref('');
const password = ref('');

const handleLogin = async () => {
  try {
    await adminLogin({ email: email.value, password: password.value });
    router.push('/dashboard');
  } catch (e) {
    // Error is handled in composable, can also show a toast here
  }
};
</script>
