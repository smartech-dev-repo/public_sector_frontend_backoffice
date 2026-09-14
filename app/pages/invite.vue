<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
    <div class="max-w-[400px] w-full">
      <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
        <!-- Logo placeholder -->
          <div class="mx-auto rounded-lg flex items-center justify-center mb-6">
          <img src="@/assets/img/logo.png" class="h-6 w-auto" />
        </div>
        
        <h2 class="text-xl text-center font-semibold text-slate-900 text-left">You've been invited.</h2>
        <p class="mt-2 text-center text-sm text-slate-500 text-left mb-6">John has invited you to join Moneyfield Public Sector Admin Portal.</p>

        <form class="space-y-4 text-left" @submit.prevent="handleAccept">
          <!-- Readonly email input using standard input style to match screenshot -->
          <div class="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[15px] font-medium text-slate-700">
            name@moneyfieldmfb.com
          </div>
          
          <button type="submit" class="w-full mt-2 py-3 px-4 rounded-xl text-white font-medium bg-emerald-500 hover:bg-emerald-600 transition-colors">
            Accept Invitation
          </button>
        </form>

        <div class="mt-6 text-sm text-slate-600">
          Not interested in joining? <button @click="handleDecline" class="text-red-500 hover:underline font-medium">Decline invitation</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

definePageMeta({
  layout: false
});

const router = useRouter();

const handleAccept = () => {
  router.push('/setup-account');
};

const handleDecline = () => {
  // Simple action for now
  router.push('/login');
};
</script>
