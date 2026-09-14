<template>
  <div class="space-y-8 pb-12">
    <!-- Breadcrumb -->
    <div class="text-sm">
      <NuxtLink to="/credit-risk/customer-management" class="text-slate-400 hover:text-slate-600 transition-colors">Customer management</NuxtLink>
      <span class="text-slate-400 mx-2">/</span>
      <span class="text-slate-900 font-medium">Customer details</span>
    </div>

    <!-- Customer Details Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-2">
      <div>
        <p class="text-[12px] text-slate-400 mb-1">Name</p>
        <p class="text-[16px] font-semibold text-slate-900">Chukwuemeka Ibe</p>
      </div>
      <div>
        <p class="text-[12px] text-slate-400 mb-1">IPPIS</p>
        <p class="text-[16px] font-semibold text-slate-900">06731234821</p>
      </div>
      <div>
        <p class="text-[12px] text-slate-400 mb-1">Bvn</p>
        <p class="text-[16px] font-semibold text-slate-900">123456784821</p>
      </div>
      <div>
        <p class="text-[12px] text-slate-400 mb-1">Nin</p>
        <p class="text-[16px] font-semibold text-slate-900">1234567890</p>
      </div>
      <div>
        <p class="text-[12px] text-slate-400 mb-1">Phone</p>
        <p class="text-[16px] font-semibold text-slate-900">08031234821</p>
      </div>
      <div>
        <p class="text-[12px] text-slate-400 mb-1">Nationality</p>
        <p class="text-[16px] font-semibold text-slate-900">Nigerian</p>
      </div>
      <div class="md:col-span-2">
        <p class="text-[12px] text-slate-400 mb-1">Address</p>
        <p class="text-[16px] font-semibold text-slate-900">14 Adeniran Ogunsanya St, Surulere, Lagos</p>
        
        <!-- Assignee Tag -->
        <div class="mt-4 inline-flex items-center gap-3 bg-emerald-50/50 border border-emerald-100 rounded-xl p-2.5">
          <div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold">
            WA
          </div>
          <div class="flex flex-col pr-4">
            <span class="text-[13px] font-medium text-slate-900 leading-tight">Fawwaz Ali-Balogun</span>
            <span class="text-[10px] text-slate-500">f.bakare@moneyfield.ng &nbsp;&bull;&nbsp; 07012345678</span>
          </div>
        </div>
      </div>
    </div>

    <hr class="border-slate-100" />

    <!-- Loan Stats -->
    <div class="flex flex-wrap items-center gap-y-6 gap-x-12">
      <div>
        <p class="text-[12px] text-slate-400 mb-1 font-medium">Loan amount</p>
        <p class="text-xl font-bold text-slate-900">NGN 23,234,34</p>
      </div>
      <div>
        <p class="text-[12px] text-slate-400 mb-1 font-medium">Interest rate</p>
        <p class="text-xl font-bold text-slate-900">12%</p>
      </div>
      <div>
        <p class="text-[12px] text-slate-400 mb-1 font-medium">Duration</p>
        <p class="text-xl font-bold text-slate-900">12 months</p>
      </div>
      <div>
        <p class="text-[12px] text-slate-400 mb-1 font-medium">Monthly repayment</p>
        <p class="text-xl font-bold text-slate-900">NGN 34,345,253</p>
      </div>
      <div>
        <p class="text-[12px] text-slate-400 mb-1 font-medium">Outstanding payment</p>
        <p class="text-xl font-bold text-slate-900">NGN 34,345,253</p>
      </div>
      <div>
        <p class="text-[12px] text-slate-400 mb-1 font-medium">Next payment date</p>
        <p class="text-xl font-bold text-slate-900">24th July 2098</p>
      </div>
    </div>

    <hr class="border-slate-100" />

    <!-- Repayments List -->
    <div class="space-y-1">
      <div v-for="i in 8" :key="i" class="flex items-center justify-between py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors px-2 -mx-2 rounded-lg">
        <div>
          <h4 class="font-medium text-slate-900 mb-1">Loan repayment from Jurgen Klopp</h4>
          <p class="text-[13px] text-slate-400">July 2026</p>
        </div>
        <div class="text-right">
          <h4 class="font-bold text-slate-900 mb-1">NGN 3,532,549</h4>
          <p class="text-[13px] text-slate-400">2:45PM</p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
definePageMeta({
  layout: 'credit-risk'
});
</script>
