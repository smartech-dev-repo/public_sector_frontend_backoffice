"use client";

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLoans } from '@/app/composables/modules/useLoans';
import { useToast } from '@/app/composables/useToast';
import PulseLoader from '@/app/components/ui/PulseLoader';
import { 
  ArrowLeft, 
  Check, 
  Info 
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/Select';
import { MultiSelect } from '@/app/components/ui/MultiSelect';

const SECTOR_OPTIONS = [
  { code: 'NPF', name: 'Nigerian Police Force' },
  { code: 'LASG', name: 'Lagos State Civil Service' },
  { code: 'IPPIS', name: 'Federal Civil Service (IPPIS)' },
  { code: 'NSCDC', name: 'Military & Paramilitary' },
  { code: 'IMMIGRATION', name: 'Nigeria Immigration Service' },
  { code: 'CORRECTIONAL', name: 'Nigerian Correctional Service' },
  { code: 'CUSTOM', name: 'Nigeria Customs Service' }
];

const PRESET_PRODUCTS = [
  { name: 'NPF Personal Loan', code: 'MMFB-NPFPL', sector: 'NPF' },
  { name: 'Police Special Asset Loan', code: 'MMFB-PSAL', sector: 'NPF' },
  { name: 'Civil Service Personal Loan', code: 'MMFB-CSPL', sector: 'IPPIS' },
  { name: 'Lagos State Employee Loan', code: 'MMFB-LSEL', sector: 'LASG' },
  { name: 'Paramilitary Welfare Loan', code: 'MMFB-PMWL', sector: 'NSCDC' }
];

function ProductFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  const isEdit = Boolean(productId);

  const { 
    loanProducts, 
    loanProductSectors,
    fetchLoanProducts, 
    createLoanProduct, 
    updateLoanProduct, 
    fetchLoanProductSectors 
  } = useLoans();

  const { addToast } = useToast();

  // Clean, un-prefilled default state
  const [form, setForm] = useState({
    productName: '',
    productCode: '',
    sectors: [] as string[],
    minimumAmount: 0,
    maximumAmount: 0,
    minimumTenorMonths: 6,
    maximumTenorMonths: 12,
    // Interest rate tiers
    tier1Rate: 0, // 6-12 months
    tier2Rate: 0, // 13-18 months
    tier3Rate: 0, // 19-24 months
    tier4Rate: 0, // 25-30 months
    // Eligibility
    minimumServiceMonthsLeft: 24,
    maximumMonthsInService: 35,
    // Management charge
    managementChargeType: 'PERCENTAGE',
    managementChargeValue: 0,
    managementChargeApplication: 'DEDUCT_FROM_DISBURSEMENT'
  });

  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load sectors
  useEffect(() => {
    fetchLoanProductSectors();
  }, [fetchLoanProductSectors]);

  // If in Edit mode, load product by ID
  useEffect(() => {
    if (isEdit && productId) {
      setLoadingData(true);
      fetchLoanProducts().then((products) => {
        const found = products?.find((p: any) => p.id === productId);
        if (found) {
          const tiers = found.interestTiers || [];
          const t1 = tiers[0]?.interestRatePercent ?? 0;
          const t2 = tiers[1]?.interestRatePercent ?? t1;
          const t3 = tiers[2]?.interestRatePercent ?? t1;
          const t4 = tiers[3]?.interestRatePercent ?? t1;

          setForm({
            productName: found.productName || '',
            productCode: found.productCode || '',
            sectors: found.sectors || [],
            minimumAmount: Number(found.minimumAmount) || 0,
            maximumAmount: Number(found.maximumAmount) || 0,
            minimumTenorMonths: Number(found.minimumTenorMonths) || 6,
            maximumTenorMonths: Number(found.maximumTenorMonths) || 12,
            tier1Rate: t1,
            tier2Rate: t2,
            tier3Rate: t3,
            tier4Rate: t4,
            minimumServiceMonthsLeft: found.minimumServiceMonthsLeft !== null ? Number(found.minimumServiceMonthsLeft) : 24,
            maximumMonthsInService: found.maximumMonthsInService !== null ? Number(found.maximumMonthsInService) : 35,
            managementChargeType: found.managementChargeType || 'PERCENTAGE',
            managementChargeValue: Number(found.managementChargeValue) || 0,
            managementChargeApplication: found.managementChargeApplication || 'DEDUCT_FROM_DISBURSEMENT'
          });
        }
        setLoadingData(false);
      });
    }
  }, [isEdit, productId, fetchLoanProducts]);

  // Available sectors combined
  const availableSectors = useMemo(() => {
    const list = [...SECTOR_OPTIONS];
    if (loanProductSectors && loanProductSectors.length > 0) {
      loanProductSectors.forEach((s: string) => {
        if (!list.some(item => item.code === s)) {
          list.push({ code: s, name: s });
        }
      });
    }
    return list;
  }, [loanProductSectors]);

  const sectorOptions = useMemo(() => {
    return availableSectors.map((s) => ({
      label: s.name,
      value: s.code,
      badge: s.code,
    }));
  }, [availableSectors]);

  const activeSectorName = useMemo(() => {
    if (form.sectors.length === 0) return 'All Sectors';
    if (form.sectors.length === availableSectors.length) return 'All Eligible Sectors';
    const primary = form.sectors[0];
    const found = availableSectors.find(s => s.code === primary);
    const primaryLabel = found ? found.name : primary;
    if (form.sectors.length > 1) {
      return `${primaryLabel} (+${form.sectors.length - 1} more)`;
    }
    return primaryLabel;
  }, [form.sectors, availableSectors]);

  // Save handler
  const handleSaveProduct = async () => {
    if (!form.productName.trim()) {
      return addToast('Product name is required', 'error');
    }
    if (!form.productCode.trim()) {
      return addToast('Product code is required', 'error');
    }
    if (form.sectors.length === 0) {
      return addToast('Please select at least one eligible sector', 'error');
    }
    if (!form.minimumAmount || form.minimumAmount <= 0) {
      return addToast('Please enter a valid minimum amount', 'error');
    }
    if (!form.maximumAmount || form.maximumAmount <= form.minimumAmount) {
      return addToast('Maximum amount must be greater than minimum amount', 'error');
    }
    if (form.minimumTenorMonths <= 0 || form.maximumTenorMonths < form.minimumTenorMonths) {
      return addToast('Maximum tenor must be greater than or equal to minimum tenor', 'error');
    }

    const minT = Number(form.minimumTenorMonths);
    const maxT = Number(form.maximumTenorMonths);
    
    const interestTiers = [
      {
        minTenorMonths: minT,
        maxTenorMonths: maxT,
        interestRatePercent: Number(form.tier1Rate) || 0
      }
    ];

    const payload = {
      productName: form.productName.trim(),
      productCode: form.productCode.trim().toUpperCase(),
      sectors: form.sectors,
      minimumAmount: Number(form.minimumAmount),
      maximumAmount: Number(form.maximumAmount),
      minimumTenorMonths: minT,
      maximumTenorMonths: maxT,
      interestTiers,
      managementChargeType: form.managementChargeType,
      managementChargeValue: Number(form.managementChargeValue) || 0,
      managementChargeApplication: form.managementChargeApplication,
      minimumServiceMonthsLeft: Number(form.minimumServiceMonthsLeft),
      maximumMonthsInService: Number(form.maximumMonthsInService)
    };

    setSubmitting(true);
    try {
      if (isEdit && productId) {
        await updateLoanProduct(productId, payload);
        addToast('Loan product updated successfully', 'success');
      } else {
        await createLoanProduct(payload);
        addToast('Loan product created successfully', 'success');
      }
      router.push('/dashboard/loan-products');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save loan product';
      addToast(typeof msg === 'string' ? msg : JSON.stringify(msg), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="py-24 flex justify-center items-center">
        <PulseLoader />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Top Header & Breadcrumb */}
      <div>
        <Link
          href="/dashboard/loan-products"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group mb-3"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Loan Products</span>
        </Link>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          {isEdit ? 'Edit Product' : 'New product'}
        </h1>
        <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
          Configure pricing, fees, interest and eligibility. The calculator on the right shows what an applicant will see when they select.
        </p>
      </div>

      {/* 2-Column Standalone Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: The Configuration Form (8 cols) */}
        <div className="lg:col-span-8 bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-7 shadow-sm">
          
          {/* Product Name & Product Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Product name
                </label>
                <div className="flex items-center gap-1">
                  <Select 
                    value="" 
                    onValueChange={(val) => {
                      const preset = PRESET_PRODUCTS.find(p => p.name === val);
                      if (preset) {
                        setForm(prev => ({
                          ...prev,
                          productName: preset.name,
                          productCode: preset.code,
                          sectors: prev.sectors.includes(preset.sector) ? prev.sectors : [...prev.sectors, preset.sector]
                        }));
                      }
                    }}
                  >
                    <SelectTrigger className="h-6 px-2 text-[11px] rounded-lg bg-muted/40 border-border text-muted-foreground hover:text-foreground">
                      <SelectValue placeholder="Preset templates" />
                    </SelectTrigger>
                    <SelectContent hideSearch>
                      {PRESET_PRODUCTS.map(p => (
                        <SelectItem key={p.code} value={p.name}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <input
                type="text"
                value={form.productName}
                onChange={(e) => setForm({ ...form, productName: e.target.value })}
                placeholder="e.g. Nigerian Police Force Personal Loan"
                className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#018752]/20 focus:border-[#018752] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Product code
              </label>
              <input
                type="text"
                value={form.productCode}
                onChange={(e) => setForm({ ...form, productCode: e.target.value.toUpperCase() })}
                placeholder="e.g. MMFB-NPFPL"
                className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#018752]/20 focus:border-[#018752] outline-none transition-all uppercase font-mono"
              />
            </div>
          </div>

          {/* Eligible Sectors */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Eligible sectors <span className="text-destructive">*</span>
              </label>
              {form.sectors.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {form.sectors.length} of {availableSectors.length} selected
                </span>
              )}
            </div>
            <MultiSelect
              options={sectorOptions}
              value={form.sectors}
              onChange={(newSectors) => setForm(prev => ({ ...prev, sectors: newSectors }))}
              placeholder="Select eligible sectors..."
              searchPlaceholder="Search sectors (e.g. Police, LASG, IPPIS)..."
            />
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Choose one or more government sectors eligible for this loan product.
            </p>
          </div>

          {/* Minimum & Maximum Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Minimum amount (₦)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-sm font-semibold text-muted-foreground select-none">
                  ₦
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.minimumAmount ? Number(form.minimumAmount).toLocaleString('en-US') : ''}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d]/g, '');
                    setForm({ ...form, minimumAmount: raw ? Number(raw) : 0 });
                  }}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#018752]/20 focus:border-[#018752] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Maximum amount (₦)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-sm font-semibold text-muted-foreground select-none">
                  ₦
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.maximumAmount ? Number(form.maximumAmount).toLocaleString('en-US') : ''}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d]/g, '');
                    setForm({ ...form, maximumAmount: raw ? Number(raw) : 0 });
                  }}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#018752]/20 focus:border-[#018752] outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Minimum & Maximum Tenor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Minimum tenor (months)
              </label>
              <Select
                value={String(form.minimumTenorMonths)}
                onValueChange={(val) => setForm({ ...form, minimumTenorMonths: Number(val) })}
              >
                <SelectTrigger className="w-full h-11 bg-muted/30 border-border rounded-xl text-sm font-medium">
                  <SelectValue placeholder="Select minimum tenor" />
                </SelectTrigger>
                <SelectContent hideSearch>
                  {[1, 3, 6, 9, 12, 18, 24].map(m => (
                    <SelectItem key={m} value={String(m)}>{m} months</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Maximum tenor (months)
              </label>
              <Select
                value={String(form.maximumTenorMonths)}
                onValueChange={(val) => setForm({ ...form, maximumTenorMonths: Number(val) })}
              >
                <SelectTrigger className="w-full h-11 bg-muted/30 border-border rounded-xl text-sm font-medium">
                  <SelectValue placeholder="Select maximum tenor" />
                </SelectTrigger>
                <SelectContent hideSearch>
                  {[6, 12, 18, 24, 30, 36, 48].map(m => (
                    <SelectItem key={m} value={String(m)}>{m} months</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Interest Rate Matrix */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Interest rate matrix</h3>
              <span className="text-[11px] font-semibold text-[#018752] bg-[#E8F5EE] px-3 py-1 rounded-full">
                {activeSectorName}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-3 bg-muted/20 border border-border rounded-2xl space-y-1">
                <span className="text-[11px] text-muted-foreground block font-medium">6-12 months</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.05"
                    value={form.tier1Rate || ''}
                    onChange={(e) => setForm({ ...form, tier1Rate: Number(e.target.value) })}
                    placeholder="0.0"
                    className="w-full bg-transparent font-bold text-sm outline-none"
                  />
                  <span className="text-xs font-semibold text-muted-foreground">%</span>
                </div>
              </div>

              <div className="p-3 bg-muted/20 border border-border rounded-2xl space-y-1">
                <span className="text-[11px] text-muted-foreground block font-medium">13-18 months</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.05"
                    value={form.tier2Rate || ''}
                    onChange={(e) => setForm({ ...form, tier2Rate: Number(e.target.value) })}
                    placeholder="0.0"
                    className="w-full bg-transparent font-bold text-sm outline-none"
                  />
                  <span className="text-xs font-semibold text-muted-foreground">%</span>
                </div>
              </div>

              <div className="p-3 bg-muted/20 border border-border rounded-2xl space-y-1">
                <span className="text-[11px] text-muted-foreground block font-medium">19-24 months</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.05"
                    value={form.tier3Rate || ''}
                    onChange={(e) => setForm({ ...form, tier3Rate: Number(e.target.value) })}
                    placeholder="0.0"
                    className="w-full bg-transparent font-bold text-sm outline-none"
                  />
                  <span className="text-xs font-semibold text-muted-foreground">%</span>
                </div>
              </div>

              <div className="p-3 bg-muted/20 border border-border rounded-2xl space-y-1">
                <span className="text-[11px] text-muted-foreground block font-medium">25-30 months</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.05"
                    value={form.tier4Rate || ''}
                    onChange={(e) => setForm({ ...form, tier4Rate: Number(e.target.value) })}
                    placeholder="0.0"
                    className="w-full bg-transparent font-bold text-sm outline-none"
                  />
                  <span className="text-xs font-semibold text-muted-foreground">%</span>
                </div>
              </div>
            </div>

            {/* Information Banner */}
            <div className="flex items-start gap-2.5 p-3.5 bg-[#E8F5EE]/70 dark:bg-emerald-950/20 border border-[#018752]/20 rounded-2xl">
              <Info className="w-4 h-4 text-[#018752] shrink-0 mt-0.5" />
              <p className="text-xs text-[#018752] dark:text-emerald-300 leading-relaxed font-medium">
                Rate type is fixed for the life of the loan. Amounts or tenors outside every band are rejected at application.
              </p>
            </div>
          </div>

          {/* Eligibility */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Eligibility</h3>
              <span className="text-[11px] font-semibold text-[#018752] bg-[#E8F5EE] px-3 py-1 rounded-full">
                {activeSectorName}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Min. service left (months)
                </label>
                <Select
                  value={String(form.minimumServiceMonthsLeft)}
                  onValueChange={(val) => setForm({ ...form, minimumServiceMonthsLeft: Number(val) })}
                >
                  <SelectTrigger className="w-full h-11 bg-muted/30 border-border rounded-xl text-sm font-medium">
                    <SelectValue placeholder="Select minimum service left" />
                  </SelectTrigger>
                  <SelectContent hideSearch>
                    {[6, 12, 18, 24, 36, 48].map(m => (
                      <SelectItem key={m} value={String(m)}>{m} months</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Max. years in service
                </label>
                <Select
                  value={String(form.maximumMonthsInService)}
                  onValueChange={(val) => setForm({ ...form, maximumMonthsInService: Number(val) })}
                >
                  <SelectTrigger className="w-full h-11 bg-muted/30 border-border rounded-xl text-sm font-medium">
                    <SelectValue placeholder="Select max years in service" />
                  </SelectTrigger>
                  <SelectContent hideSearch>
                    {[25, 30, 35, 40].map(y => (
                      <SelectItem key={y} value={String(y)}>{y} years</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Management Charge */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Management Charge</h3>
              <span className="text-[11px] font-semibold text-[#018752] bg-[#E8F5EE] px-3 py-1 rounded-full">
                {form.managementChargeType === 'PERCENTAGE' 
                  ? `${form.managementChargeValue || 0}%` 
                  : `₦${Number(form.managementChargeValue || 0).toLocaleString()}`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Charge Type
                </label>
                <Select
                  value={form.managementChargeType}
                  onValueChange={(val) => setForm({ ...form, managementChargeType: val })}
                >
                  <SelectTrigger className="w-full h-11 bg-muted/30 border-border rounded-xl text-sm font-medium">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent hideSearch>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="FIXED">Fixed Amount (₦)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Charge Value ({form.managementChargeType === 'PERCENTAGE' ? '%' : '₦'})
                </label>
                <div className="relative flex items-center">
                  {form.managementChargeType === 'FIXED' && (
                    <span className="absolute left-4 text-sm font-semibold text-muted-foreground select-none">
                      ₦
                    </span>
                  )}
                  <input
                    type="text"
                    inputMode={form.managementChargeType === 'PERCENTAGE' ? 'decimal' : 'numeric'}
                    value={
                      form.managementChargeType === 'PERCENTAGE'
                        ? (form.managementChargeValue || '')
                        : (form.managementChargeValue ? Number(form.managementChargeValue).toLocaleString('en-US') : '')
                    }
                    onChange={(e) => {
                      if (form.managementChargeType === 'PERCENTAGE') {
                        const val = e.target.value.replace(/[^\d.]/g, '');
                        setForm({ ...form, managementChargeValue: val ? Number(val) : 0 });
                      } else {
                        const raw = e.target.value.replace(/[^\d]/g, '');
                        setForm({ ...form, managementChargeValue: raw ? Number(raw) : 0 });
                      }
                    }}
                    placeholder="0"
                    className={`w-full ${
                      form.managementChargeType === 'FIXED' ? 'pl-8' : 'px-4'
                    } py-2.5 bg-muted/30 border border-border rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#018752]/20 focus:border-[#018752] outline-none transition-all`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Application Method
                </label>
                <Select
                  value={form.managementChargeApplication}
                  onValueChange={(val) => setForm({ ...form, managementChargeApplication: val })}
                >
                  <SelectTrigger className="w-full h-11 bg-muted/30 border-border rounded-xl text-sm font-medium">
                    <SelectValue placeholder="Select application" />
                  </SelectTrigger>
                  <SelectContent hideSearch>
                    <SelectItem value="DEDUCT_FROM_DISBURSEMENT">Deduct from Disbursement</SelectItem>
                    <SelectItem value="CAPITALIZE_INTO_PRINCIPAL">Capitalize into Principal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="pt-4 flex items-center justify-between border-t border-border">
            <Link
              href="/dashboard/loan-products"
              className="px-6 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted text-sm font-semibold transition-colors"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={handleSaveProduct}
              disabled={submitting}
              className="px-8 py-2.5 bg-[#018752] hover:bg-[#017044] text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Live Preview Card (4 cols, matches Image 4) */}
        <div className="lg:col-span-4 sticky top-6">
          <div className="bg-[#E8F5EE]/60 dark:bg-emerald-950/20 border border-[#018752]/20 rounded-3xl p-6 sm:p-7 space-y-6">
            
            <h3 className="text-lg font-bold text-foreground">Preview</h3>

            <div className="space-y-4">
              <div>
                <div className="text-xs text-muted-foreground font-medium mb-1">Product name</div>
                <div className="text-sm font-semibold text-foreground">
                  {form.productName.trim() || '—'}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground font-medium mb-1">Product code</div>
                <div className="text-sm font-mono font-semibold text-foreground">
                  {form.productCode.trim() || '—'}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground font-medium mb-1">Minimum amount (₦)</div>
                <div className="text-sm font-semibold text-foreground">
                  {form.minimumAmount > 0 ? `NGN ${Number(form.minimumAmount).toLocaleString()}` : '—'}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground font-medium mb-1">Maximum amount (₦)</div>
                <div className="text-sm font-semibold text-foreground">
                  {form.maximumAmount > 0 ? `NGN ${Number(form.maximumAmount).toLocaleString()}` : '—'}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground font-medium mb-1">Tenor</div>
                <div className="text-sm font-semibold text-foreground">
                  {form.maximumTenorMonths ? `${form.maximumTenorMonths} months` : '—'}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground font-medium mb-1">Interest rate (per month)</div>
                <div className="text-sm font-bold text-[#018752]">
                  {form.tier1Rate > 0 ? `${form.tier1Rate}%` : '—'}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#018752]/20 text-xs text-muted-foreground leading-relaxed">
              Applicants will view these exact parameters during loan request calculation.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function StandaloneProductPage() {
  return (
    <Suspense fallback={
      <div className="py-24 flex justify-center items-center">
        <PulseLoader />
      </div>
    }>
      <ProductFormContent />
    </Suspense>
  );
}
