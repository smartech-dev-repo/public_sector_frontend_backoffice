<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
    <div class="max-w-[420px] w-full">
      <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
        <!-- Logo placeholder -->
         <div class="mx-auto rounded-lg flex items-center justify-center mb-6">
          <img src="@/assets/img/logo.png" class="h-6 w-auto" />
        </div>
        
        <h2 class="text-2xl font-semibold text-slate-900 text-left">Create a new password</h2>
        <p class="mt-2 text-sm text-slate-500 text-left mb-6">Choose a new password for name@moneyfieldmfb.com</p>

        <form class="space-y-4 text-left" @submit.prevent="handleReset">
          <AuthInput
            v-model="password"
            label="New password"
            type="password"
            placeholder="!@#$%^&*(password)"
            required
          />
          <AuthInput
            v-model="confirmPassword"
            label="Confirm new password"
            type="password"
            placeholder="!@#$%^&*(password)"
            required
          />
          
          <div class="flex flex-wrap gap-2 mt-4">
            <span :class="pillClass(hasMinLength)">At least 8 characters</span>
            <span :class="pillClass(hasUpper)">One uppercase letter</span>
            <span :class="pillClass(hasLower)">One lowercase letter</span>
            <span :class="pillClass(hasNumber)">One number</span>
            <span :class="pillClass(hasSymbol)">One symbol</span>
          </div>
          
          <button type="submit" class="w-full mt-6 py-3 px-4 rounded-xl text-white font-medium bg-emerald-500 hover:bg-emerald-600 transition-colors">
            Reset password
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

definePageMeta({
  layout: false
});

const router = useRouter();
const password = ref('');
const confirmPassword = ref('');

const hasMinLength = computed(() => password.value.length >= 8);
const hasUpper = computed(() => /[A-Z]/.test(password.value));
const hasLower = computed(() => /[a-z]/.test(password.value));
const hasNumber = computed(() => /[0-9]/.test(password.value));
const hasSymbol = computed(() => /[^A-Za-z0-9]/.test(password.value));

const pillClass = (isValid) => {
  if (isValid) {
    return 'px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-medium rounded-full transition-colors';
  }
  return 'px-2.5 py-1 bg-slate-50 text-slate-500 text-[11px] font-medium rounded-full transition-colors';
};

const handleReset = () => {
  if (password.value !== confirmPassword.value) {
    alert("Passwords do not match");
    return;
  }
  router.push('/password-reset-success');
};
</script>
