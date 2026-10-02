"use client";

import Link from 'next/link';

export default function CustomerDetailsPage() {
 return (
  <div className="space-y-8 pb-12">
   {/* Breadcrumb */}
   <div className="text-sm">
    <Link href="/dashboard/customer-management" className="text-muted-foreground/70 hover:text-muted-foreground transition-colors">Customer management</Link>
    <span className="text-muted-foreground/70 mx-2">/</span>
    <span className="text-foreground font-medium">Customer details</span>
   </div>

   {/* Customer Details Grid */}
   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-2">
    <div>
     <p className="text-[12px] text-muted-foreground/70 mb-1">Name</p>
     <p className="text-[16px] font-semibold text-foreground">Chukwuemeka Ibe</p>
    </div>
    <div>
     <p className="text-[12px] text-muted-foreground/70 mb-1">IPPIS</p>
     <p className="text-[16px] font-semibold text-foreground">06731234821</p>
    </div>
    <div>
     <p className="text-[12px] text-muted-foreground/70 mb-1">Bvn</p>
     <p className="text-[16px] font-semibold text-foreground">123456784821</p>
    </div>
    <div>
     <p className="text-[12px] text-muted-foreground/70 mb-1">Nin</p>
     <p className="text-[16px] font-semibold text-foreground">1234567890</p>
    </div>
    <div>
     <p className="text-[12px] text-muted-foreground/70 mb-1">Phone</p>
     <p className="text-[16px] font-semibold text-foreground">08031234821</p>
    </div>
    <div>
     <p className="text-[12px] text-muted-foreground/70 mb-1">Nationality</p>
     <p className="text-[16px] font-semibold text-foreground">Nigerian</p>
    </div>
    <div className="md:col-span-2">
     <p className="text-[12px] text-muted-foreground/70 mb-1">Address</p>
     <p className="text-[16px] font-semibold text-foreground">14 Adeniran Ogunsanya St, Surulere, Lagos</p>
     
     {/* Assignee Tag */}
     <div className="mt-4 inline-flex items-center gap-3 bg-emerald-50/50 border border-emerald-100 rounded-xl p-2.5">
      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold">
       WA
      </div>
      <div className="flex flex-col pr-4">
       <span className="text-[13px] font-medium text-foreground leading-tight">Fawwaz Ali-Balogun</span>
       <span className="text-[10px] text-muted-foreground">f.bakare@moneyfield.ng &nbsp;&bull;&nbsp; 07012345678</span>
      </div>
     </div>
    </div>
   </div>

   <hr className="border-border/50" />

   {/* Loan Stats */}
   <div className="flex flex-wrap items-center gap-y-6 gap-x-12">
    <div>
     <p className="text-[12px] text-muted-foreground/70 mb-1 font-medium">Loan amount</p>
     <p className="text-xl font-bold text-foreground">NGN 23,234,34</p>
    </div>
    <div>
     <p className="text-[12px] text-muted-foreground/70 mb-1 font-medium">Interest rate</p>
     <p className="text-xl font-bold text-foreground">12%</p>
    </div>
    <div>
     <p className="text-[12px] text-muted-foreground/70 mb-1 font-medium">Duration</p>
     <p className="text-xl font-bold text-foreground">12 months</p>
    </div>
    <div>
     <p className="text-[12px] text-muted-foreground/70 mb-1 font-medium">Monthly repayment</p>
     <p className="text-xl font-bold text-foreground">NGN 34,345,253</p>
    </div>
    <div>
     <p className="text-[12px] text-muted-foreground/70 mb-1 font-medium">Outstanding payment</p>
     <p className="text-xl font-bold text-foreground">NGN 34,345,253</p>
    </div>
    <div>
     <p className="text-[12px] text-muted-foreground/70 mb-1 font-medium">Next payment date</p>
     <p className="text-xl font-bold text-foreground">24th July 2098</p>
    </div>
   </div>

   <hr className="border-border/50" />

   {/* Repayments List */}
   <div className="space-y-1">
    {[...Array(8)].map((_, i) => (
     <div key={i} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0 hover:bg-muted/30/50 transition-colors px-2 -mx-2 rounded-lg">
      <div>
       <h4 className="font-medium text-foreground mb-1">Loan repayment from Jurgen Klopp</h4>
       <p className="text-[13px] text-muted-foreground/70">July 2026</p>
      </div>
      <div className="text-right">
       <h4 className="font-bold text-foreground mb-1">NGN 3,532,549</h4>
       <p className="text-[13px] text-muted-foreground/70">2:45PM</p>
      </div>
     </div>
    ))}
   </div>
  </div>
 );
}
