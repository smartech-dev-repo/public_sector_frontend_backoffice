<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
    <div class="max-w-[400px] w-full">
      <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
        <!-- Logo placeholder -->
          <div class="mx-auto rounded-lg flex items-center justify-center mb-6">
          <img src="@/assets/img/logo.png" class="h-6 w-auto" />
        </div>
        
        <h2 class="text-2xl font-semibold text-slate-900 text-left">Forgot password</h2>
        <p class="mt-2 text-sm text-slate-500 text-left mb-6">Enter your email address and we'll send you a link to reset your password.</p>

        <form class="space-y-4 text-left" @submit.prevent="handleReset">
          <AuthInput
            v-model="email"
            label="Enter your email"
            type="email"
            placeholder="example@mmfb.com"
            required
          />
          
          <button type="submit" class="w-full mt-2 py-3 px-4 rounded-xl text-white font-medium bg-emerald-500 hover:bg-emerald-600 transition-colors">
            Reset password
          </button>
        </form>

        <div class="mt-6 text-sm text-slate-600">
          <NuxtLink to="/login" class="text-emerald-600 hover:underline font-medium">Back to sign in</NuxtLink>
        </div>
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
const email = ref('');

const handleReset = () => {
  router.push('/check-email');
};
</script>
