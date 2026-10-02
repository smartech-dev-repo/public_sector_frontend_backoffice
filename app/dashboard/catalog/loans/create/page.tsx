"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/feedback/alert";
import { Info } from "lucide-react";

export default function CreateLoanProductPage() {
  const router = useRouter();
  
  // State for form
  const [productName, setProductName] = useState("");
  const [productCode, setProductCode] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [minTenor, setMinTenor] = useState("");
  const [maxTenor, setMaxTenor] = useState("");

  const [rates, setRates] = useState({
    band1: "3.5",
    band2: "3.5",
    band3: "3.5",
    band4: "3.5"
  });

  const [minServiceLeft, setMinServiceLeft] = useState("24");
  const [maxYearsInService, setMaxYearsInService] = useState("35");

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Loan Products</h1>
      </div>
      
      <div>
        <p className="text-muted-foreground text-sm">
          Configure pricing, fees, interest and eligibility. The calculator on the right shows what an applicant will see when they select
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* New product Section */}
          <section className="bg-card border border-border rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-foreground">New product</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 text-left">
                <label className="text-sm text-foreground/80 font-medium">Product name</label>
                <Select value={productName} onValueChange={setProductName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nigerian Police Force">Nigerian Police Force</SelectItem>
                    <SelectItem value="Federal Civil Service">Federal Civil Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-sm text-foreground/80 font-medium">Product code</label>
                <Select value={productCode} onValueChange={setProductCode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MMFB-NPFPL">MMFB-NPFPL</SelectItem>
                    <SelectItem value="MMFB-FCS">MMFB-FCS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm text-foreground/80 font-medium">Eligible sectors</label>
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1.5 rounded-full border border-emerald-500 bg-emerald-50/50 text-emerald-700 text-xs font-medium dark:bg-emerald-500/10 dark:text-emerald-400">
                  Nigerian Police Force
                </div>
                <div className="px-3 py-1.5 rounded-full border border-border bg-muted/50 text-muted-foreground text-xs font-medium">
                  Federal Civil Service (IPPIS)
                </div>
                <div className="px-3 py-1.5 rounded-full border border-border bg-muted/50 text-muted-foreground text-xs font-medium">
                  Lagos State Civil Service
                </div>
                <div className="px-3 py-1.5 rounded-full border border-border bg-muted/50 text-muted-foreground text-xs font-medium">
                  Military & Paramilitary
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 text-left">
                <label className="text-sm text-foreground/80 font-medium">Minimum amount ( ₦ )</label>
                <Input type="number" placeholder="0.00" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-sm text-foreground/80 font-medium">Maximum amount ( ₦ )</label>
                <Input type="number" placeholder="0.00" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 text-left">
                <label className="text-sm text-foreground/80 font-medium">Minimum tenor (months)</label>
                <Select value={minTenor} onValueChange={setMinTenor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-sm text-foreground/80 font-medium">Maximum tenor (months)</label>
                <Select value={maxTenor} onValueChange={setMaxTenor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="36">36</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Interest Rate Matrix Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Interest rate matrix</h2>
              <div className="px-2 py-1 rounded-md border border-emerald-500 bg-emerald-50/50 text-emerald-700 text-[10px] font-medium uppercase tracking-wider dark:bg-emerald-500/10 dark:text-emerald-400">
                Nigerian Police Force
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 text-left">
                <label className="text-sm text-foreground/80">6–12 months</label>
                <div className="relative">
                  <Input type="number" value={rates.band1} onChange={(e) => setRates({...rates, band1: e.target.value})} className="pr-8" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                </div>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-sm text-foreground/80">13–18 months</label>
                <div className="relative">
                  <Input type="number" value={rates.band2} onChange={(e) => setRates({...rates, band2: e.target.value})} className="pr-8" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                </div>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-sm text-foreground/80">19–24 months</label>
                <div className="relative">
                  <Input type="number" value={rates.band3} onChange={(e) => setRates({...rates, band3: e.target.value})} className="pr-8" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                </div>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-sm text-foreground/80">25–30 months</label>
                <div className="relative">
                  <Input type="number" value={rates.band4} onChange={(e) => setRates({...rates, band4: e.target.value})} className="pr-8" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                </div>
              </div>
            </div>

            <Alert className="bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50">
              <Info className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <AlertDescription className="text-emerald-800 dark:text-emerald-300 ml-2 text-sm">
                Rate type is fixed for the life of the loan. Amounts or tenors outside every band are rejected at application.
              </AlertDescription>
            </Alert>
          </section>

          {/* Eligibility Section */}
          <section className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Eligibility</h2>
              <div className="px-2 py-1 rounded-md border border-emerald-500 bg-emerald-50/50 text-emerald-700 text-[10px] font-medium uppercase tracking-wider dark:bg-emerald-500/10 dark:text-emerald-400">
                Nigerian Police Force
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 text-left">
                <label className="text-sm text-foreground/80">Min. service left (months)</label>
                <Select value={minServiceLeft} onValueChange={setMinServiceLeft}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="36">36</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-sm text-foreground/80">Max. years in service</label>
                <Select value={maxYearsInService} onValueChange={setMaxYearsInService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="35">35</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <div className="flex items-center gap-4 pt-6">
            <Button variant="outline" className="w-32 border-emerald-600 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-0">
              Save Product
            </Button>
          </div>
        </div>

        {/* Right Preview Column */}
        <div className="lg:col-span-1">
          <div className="bg-[#F2FBF6] dark:bg-[#11241B] rounded-2xl p-6 sticky top-6 border border-emerald-100 dark:border-emerald-900/30">
            <h3 className="text-lg font-bold text-foreground mb-6">Preview</h3>
            
            <div className="space-y-5">
              <div className="flex justify-between items-start gap-4">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Product name</span>
                <span className="text-sm font-semibold text-right text-foreground">{productName || "Nigerian Police Force"}</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Product code</span>
                <span className="text-sm font-semibold text-right text-foreground">{productCode || "MMFB-NPFPL"}</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Minimum amount ( ₦ )</span>
                <span className="text-sm font-semibold text-right text-foreground">
                  NGN {minAmount ? Number(minAmount).toLocaleString() : "200,000"}
                </span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Maximum amount ( ₦ )</span>
                <span className="text-sm font-semibold text-right text-foreground">
                  NGN {maxAmount ? Number(maxAmount).toLocaleString() : "3,000,000"}
                </span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Tenor</span>
                <span className="text-sm font-semibold text-right text-foreground">
                  {maxTenor || "12"} months
                </span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Interest rate (per month)</span>
                <span className="text-sm font-semibold text-right text-foreground">
                  {rates.band1 || "3.95"}%
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
