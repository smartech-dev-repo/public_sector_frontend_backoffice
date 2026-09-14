<template>
 <div class="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-emerald-200">
 <header class="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
 <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
 <div class="flex items-center gap-2">
 <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-xl -500/30">
 M
 </div>
 <span class="text-xl tracking-tight text-slate-900">MakerChecker Admin</span>
 </div>
 </div>
 </header>

 <main>
 <slot />
 </main>
 </div>
</template>
