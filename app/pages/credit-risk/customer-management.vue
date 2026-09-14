<template>
  <div class="space-y-6 relative h-full">
    <!-- Actions -->
    <div class="flex items-center justify-end gap-3">
      <span class="text-sm text-slate-400 mr-2">Showing 10 of 10 Customers</span>
      <button class="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
        Filter
      </button>
      <button class="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        Export as Excel (.xlsx)
      </button>
      <button @click="openModal" class="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 rounded-lg text-sm font-medium text-white hover:bg-emerald-700 transition-colors shadow-sm ml-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        Onboard Customer
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-slate-50 rounded-xl p-5 border border-slate-100">
        <h3 class="text-[13px] text-slate-500 font-medium mb-2">Agents pending full approval</h3>
        <div class="text-3xl font-bold text-emerald-600 mb-1">31</div>
        <p class="text-[11px] text-slate-400">needs PS Lead + IC</p>
      </div>
      <div class="bg-slate-50 rounded-xl p-5 border border-slate-100">
        <h3 class="text-[13px] text-slate-500 font-medium mb-2">Customers onboarded</h3>
        <div class="text-3xl font-bold text-emerald-600 mb-1">31</div>
        <p class="text-[11px] text-slate-400">this month</p>
      </div>
      <div class="bg-slate-50 rounded-xl p-5 border border-slate-100">
        <h3 class="text-[13px] text-slate-500 font-medium mb-2">Active agents</h3>
        <div class="text-3xl font-bold text-emerald-600 mb-1">31</div>
        <p class="text-[11px] text-slate-400">in Public Sector network</p>
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-[#EAF5F0]">
            <tr>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Name</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">IPPIS NO.</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Agent</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Sector</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Loan Amt</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Date</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase">Action</th>
              <th class="px-6 py-4 font-semibold text-[#1B7855] text-xs tracking-wider uppercase"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <!-- Row 1 -->
            <tr class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-6 py-4 font-medium text-slate-900">Adaeze Nwosu</td>
              <td class="px-6 py-4 text-slate-600">23598720984</td>
              <td class="px-6 py-4 font-medium text-slate-900">Ibrahim Sani</td>
              <td class="px-6 py-4 text-slate-600">Fed. Min. Agric</td>
              <td class="px-6 py-4 font-semibold text-slate-900">&#8358;2,000,000</td>
              <td class="px-6 py-4 text-slate-600">16 Aug 2026</td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border border-emerald-200 text-[#1B7855] bg-emerald-50">
                  Payment made
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <NuxtLink to="/credit-risk/customer-details" class="font-medium text-slate-900 hover:text-emerald-600 transition-colors">
                  View
                </NuxtLink>
              </td>
            </tr>
            <!-- Row 2 -->
            <tr class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-6 py-4 font-medium text-slate-900">Adaeze Nwosu</td>
              <td class="px-6 py-4 text-slate-600">23598720984</td>
              <td class="px-6 py-4 font-medium text-slate-900">Ibrahim Sani</td>
              <td class="px-6 py-4 text-slate-600">Fed. Min. Agric</td>
              <td class="px-6 py-4 font-semibold text-slate-900">&#8358;2,000,000</td>
              <td class="px-6 py-4 text-slate-600">16 Aug 2026</td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border border-yellow-200 text-yellow-700 bg-yellow-50">
                  Awaiting payment
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <NuxtLink to="/credit-risk/customer-details" class="font-medium text-slate-900 hover:text-emerald-600 transition-colors">
                  View
                </NuxtLink>
              </td>
            </tr>
            <!-- Row 3 -->
            <tr class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-6 py-4 font-medium text-slate-900">Adaeze Nwosu</td>
              <td class="px-6 py-4 text-slate-600">23598720984</td>
              <td class="px-6 py-4 font-medium text-slate-900">Ibrahim Sani</td>
              <td class="px-6 py-4 text-slate-600">Fed. Min. Agric</td>
              <td class="px-6 py-4 font-semibold text-slate-900">&#8358;2,000,000</td>
              <td class="px-6 py-4 text-slate-600">16 Aug 2026</td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border border-yellow-200 text-yellow-700 bg-yellow-50">
                  Awaiting payment
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <NuxtLink to="/credit-risk/customer-details" class="font-medium text-slate-900 hover:text-emerald-600 transition-colors">
                  View
                </NuxtLink>
              </td>
            </tr>
            <!-- Row 4 -->
            <tr class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-6 py-4 font-medium text-slate-900">Adaeze Nwosu</td>
              <td class="px-6 py-4 text-slate-600">23598720984</td>
              <td class="px-6 py-4 font-medium text-slate-900">Ibrahim Sani</td>
              <td class="px-6 py-4 text-slate-600">Fed. Min. Agric</td>
              <td class="px-6 py-4 font-semibold text-slate-900">&#8358;2,000,000</td>
              <td class="px-6 py-4 text-slate-600">16 Aug 2026</td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border border-emerald-200 text-[#1B7855] bg-emerald-50">
                  Payment made
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <NuxtLink to="/credit-risk/customer-details" class="font-medium text-slate-900 hover:text-emerald-600 transition-colors">
                  View
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Onboarding Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="closeModal"></div>
      
      <div class="relative bg-white rounded-3xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div class="p-8 overflow-y-auto">
          
          <div class="mb-6">
            <span class="inline-block px-2 py-0.5 rounded border border-emerald-200 text-emerald-600 text-[10px] font-bold tracking-wider mb-2">Step {{ currentStep }} of 6</span>
            
            <!-- Step 1 Title -->
            <div v-if="currentStep === 1">
              <h2 class="text-2xl font-semibold text-slate-900">Start a new application</h2>
              <p class="text-[13px] text-slate-500 mt-1">First we verify your job. IPPIS confirms your name, employment and salary straight from the government payroll.</p>
            </div>
            
            <!-- Step 2 Title -->
            <div v-if="currentStep === 2">
              <h2 class="text-2xl font-semibold text-slate-900">Review with the customer</h2>
              <p class="text-[13px] text-slate-500 mt-1">Auto-filled from IPPIS (READ ONLY)</p>
            </div>

            <!-- Step 3 Title -->
            <div v-if="currentStep === 3">
              <h2 class="text-2xl font-semibold text-slate-900">Verify customer identity</h2>
              <p class="text-[13px] text-slate-500 mt-1">Customer BVN and NIN generate all your personal details date of birth, gender, address, next of kin and more.</p>
            </div>

            <!-- Step 4 Title -->
            <div v-if="currentStep === 4">
              <h2 class="text-2xl font-semibold text-slate-900">Review with the customer</h2>
              <p class="text-[13px] text-slate-500 mt-1">Auto-filled from IPPS (READ ONLY)</p>
            </div>

            <!-- Step 5 Title -->
            <div v-if="currentStep === 5">
              <h2 class="text-2xl font-semibold text-slate-900">Upload customer documents</h2>
              <p class="text-[13px] text-slate-500 mt-1">Upload your documents so we run an automatic legibility check on your file.</p>
            </div>

            <!-- Step 6 Title -->
            <div v-if="currentStep === 6">
              <h2 class="text-2xl font-semibold text-slate-900">Passport facial cross-check</h2>
              <p class="text-[13px] text-slate-500 mt-1">The customer's passport photo (in uniform) is matched 1:1 against their BVN/NIN biometric image.</p>
            </div>
          </div>

          <!-- Step 1 Content -->
          <div v-if="currentStep === 1" class="space-y-4">
            <AuthInput label="CUSTOMER IPPIS NUMBER" :modelValue="'23598720984'" />
            <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
              <svg class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <p class="text-[13px] text-amber-700">The customer must supply all information directly. No agent substitutions are permitted.</p>
            </div>
          </div>

          <!-- Step 2 Content -->
          <div v-if="currentStep === 2" class="space-y-4">
            <AuthInput label="Full Name" modelValue="Wisaz Dube" disabled />
            <AuthInput label="Employer" modelValue="Nigerian Police Force" disabled />
            <div class="grid grid-cols-2 gap-4">
              <AuthInput label="Command ID" modelValue="NPF-LAG-04" disabled />
              <AuthInput label="Length of service" modelValue="9 yrs 4 mo" disabled />
            </div>
          </div>

          <!-- Step 3 Content -->
          <div v-if="currentStep === 3" class="space-y-4">
            <AuthInput label="BVN" modelValue="23598720984" />
            <AuthInput label="NIN" modelValue="23598720984" />
            <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-3">
              <svg class="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <p class="text-[13px] text-[#1B7855]">Validated against NIBSS (BVN) and NIMC (NIN). Your name from both must match your IPPIS record.</p>
            </div>
          </div>

          <!-- Step 4 Content -->
          <div v-if="currentStep === 4" class="space-y-4">
            <AuthInput label="Full Name" modelValue="Wisaz Dube" disabled />
            <div class="grid grid-cols-2 gap-4">
              <AuthInput label="Bvn" modelValue="********4821" disabled />
              <AuthInput label="Nin" modelValue="*****7730" disabled />
              <AuthInput label="Date of birth" modelValue="14/03/1992" disabled />
              <AuthInput label="Gender" modelValue="Male" disabled />
              <AuthInput label="Marital Status" modelValue="Married" disabled />
              <AuthInput label="Phone" modelValue="0803****821" disabled />
              <AuthInput label="State of origin" modelValue="Anambra" disabled />
              <AuthInput label="Nationality" modelValue="Nigerian" disabled />
            </div>
            <AuthInput label="Home address" modelValue="14 Bourdillon Rd, Ikoyi, Lagos" disabled />
            
            <p class="text-[12px] text-slate-500 pt-2 font-medium">Employment and income (READ ONLY)</p>
            <AuthInput label="Employer" modelValue="Nigerian Police Force" disabled />
            <div class="grid grid-cols-2 gap-4">
              <AuthInput label="Command ID" modelValue="NPF-LAG-04" disabled />
              <AuthInput label="Length of service" modelValue="9 yrs 4 mo" disabled />
            </div>
          </div>

          <!-- Step 5 Content -->
          <div v-if="currentStep === 5" class="space-y-4">
            <p class="text-[12px] text-slate-500 font-medium -mb-2">NIN slip</p>
            <div class="border border-emerald-200 rounded-xl p-3 flex items-center justify-between bg-white shadow-sm">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"></path></svg>
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-900 leading-tight">Adaeze Nwosu NIN.pdf</p>
                  <p class="text-[10px] text-slate-400">1.2MB &bull; 4 seconds left</p>
                </div>
              </div>
              <div class="flex flex-col items-end gap-1">
                <button class="text-slate-400 hover:text-slate-600"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                <span class="text-[10px] font-bold text-emerald-600">73%</span>
              </div>
            </div>
            <!-- Progress bar mock -->
            <div class="w-full h-1 bg-slate-100 rounded-full overflow-hidden -mt-2">
              <div class="h-full bg-emerald-500 w-[73%]"></div>
            </div>

            <p class="text-[12px] text-slate-500 font-medium mt-4 -mb-2">Work identity card</p>
            <div class="border border-emerald-200 rounded-xl p-3 flex items-center justify-between bg-white shadow-sm">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"></path></svg>
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-900 leading-tight">Adaeze Nwosu ID.pdf</p>
                  <p class="text-[10px] text-slate-400">1.1MB</p>
                </div>
              </div>
              <div class="flex flex-col items-end gap-1">
                <button class="text-slate-400 hover:text-slate-600"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                <span class="text-[10px] font-bold text-emerald-600">100%</span>
              </div>
            </div>
            <!-- Progress bar mock -->
            <div class="w-full h-1 bg-slate-100 rounded-full overflow-hidden -mt-2">
              <div class="h-full bg-emerald-500 w-full"></div>
            </div>

            <p class="text-[12px] text-slate-500 font-medium mt-4 -mb-2">Passport photo in uniform</p>
            <div class="border border-dashed border-emerald-300 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-white cursor-pointer hover:bg-slate-50 transition-colors">
              <svg class="w-6 h-6 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              <p class="text-xs text-slate-400">Drag and drop or <span class="text-emerald-600 font-medium">choose file</span> to upload</p>
              <p class="text-[10px] text-slate-400 mt-1">.png, .jpg or .pdf</p>
            </div>

            <p class="text-[12px] text-slate-500 font-medium mt-4 -mb-2">Signature</p>
            <div class="border border-dashed border-emerald-300 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-white cursor-pointer hover:bg-slate-50 transition-colors">
              <svg class="w-6 h-6 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              <p class="text-xs text-slate-400">Drag and drop or <span class="text-emerald-600 font-medium">choose file</span> to upload</p>
              <p class="text-[10px] text-slate-400 mt-1">.png, .jpg or .pdf</p>
            </div>
          </div>

          <!-- Step 6 Content -->
          <div v-if="currentStep === 6" class="flex flex-col items-center py-8">
            <div class="flex items-center gap-8">
              <div class="flex flex-col items-center gap-2">
                <div class="w-20 h-20 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  </div>
                </div>
                <span class="text-[10px] text-slate-400 uppercase tracking-wider">Passport (Uniform)</span>
              </div>
              
              <svg class="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>

              <div class="flex flex-col items-center gap-2">
                <div class="w-20 h-20 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
                </div>
                <span class="text-[10px] text-slate-400 uppercase tracking-wider">BVN / NIN Photo</span>
              </div>
            </div>
          </div>

          <!-- Modal Actions -->
          <div class="flex gap-4 pt-6 border-t border-slate-100 mt-6">
            <button @click="prevStep" class="px-6 py-3 rounded-xl border border-emerald-500 text-emerald-600 font-medium hover:bg-emerald-50 transition-colors w-32 shrink-0">
              {{ currentStep === 1 ? 'Cancel' : 'Back' }}
            </button>
            <button @click="nextStep" class="flex-1 py-3 px-6 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors">
              {{ getProceedText() }}
            </button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

definePageMeta({
  layout: 'credit-risk'
});

const isModalOpen = ref(false);
const currentStep = ref(1);

const openModal = () => {
  isModalOpen.value = true;
  currentStep.value = 1;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  } else {
    closeModal();
  }
};

const nextStep = () => {
  if (currentStep.value < 6) {
    currentStep.value++;
  } else {
    closeModal(); // Final finish action
  }
};

const getProceedText = () => {
  if (currentStep.value === 1) return 'Look up Customer';
  if (currentStep.value === 6) return 'Complete Verification';
  return 'Proceed';
};
</script>
