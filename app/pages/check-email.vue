<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
    <div class="max-w-[400px] w-full">
      <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
        <!-- Logo placeholder -->
           <div class="mx-auto rounded-lg flex items-center justify-center mb-6">
          <img src="@/assets/img/logo.png" class="h-6 w-auto" />
        </div>
        
        <h2 class="text-xl font-semibold text-slate-900 text-left">Check your email</h2>
        <p class="mt-2 text-[13px] text-slate-500 text-left">
          You've been sent a password reset link to <NuxtLink to="/reset-password" class="text-emerald-600 font-medium">name@moneyfieldmfb.com</NuxtLink>.
        </p>
        <p class="mt-1 text-[13px] text-slate-500 text-left mb-6">
          Follow the link in the email to reset your password.
        </p>

        <NuxtLink to="/login" class="w-full mt-2 py-3 px-4 rounded-xl text-white font-medium bg-emerald-500 hover:bg-emerald-600 transition-colors block text-center">
          Back to sign in
        </NuxtLink>

        <div class="mt-6 text-[13px] text-slate-600">
          Didn't get the email? <button @click="handleResend" class="text-emerald-600 hover:underline font-medium">Resend link</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToast } from '@/composables/useToast';

definePageMeta({
  layout: false
});

const { addToast } = useToast();

const handleResend = () => {
  // Mock resend action
  addToast("Password reset link has been resent.", 'success');
};
</script>
