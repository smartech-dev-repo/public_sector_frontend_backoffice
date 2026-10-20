"use client";

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLoans } from '@/app/composables/modules/useLoans';
import { useToast } from '@/app/composables/useToast';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';
import { 
  ArrowLeft, 
  ArrowRight,
  Check, 
  Info,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  CalendarRange
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/Select';
import { MultiSelect } from '@/app/components/ui/MultiSelect';

export interface InterestTierItem {
  id: string;
  minTenorMonths: number;
  maxTenorMonths: number;
  interestRatePercent: number;
}

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

  const { isSuperAdmin, hasPermission } = useAdminPermissions();
  const canManageProducts = isSuperAdmin || hasPermission('loan-products:manage');

  const { 
    loanProducts, 
    loanProductSectors,
    fetchLoanProducts, 
    createLoanProduct, 
    updateLoanProduct, 
    fetchLoanProductSectors 
  } = useLoans();

  const { addToast } = useToast();

  // Clean, customizable default state with dynamic month ranges
  const [form, setForm] = useState({
    productName: '',
    productCode: '',
    sectors: [] as string[],
    minimumAmount: 0,
    maximumAmount: 0,
    minimumTenorMonths: 1,
    maximumTenorMonths: 12,
    // Dynamic Interest rate tiers
    interestTiers: [
      { id: '1', minTenorMonths: 1, maxTenorMonths: 3, interestRatePercent: 3.0 },
      { id: '2', minTenorMonths: 4, maxTenorMonths: 6, interestRatePercent: 3.5 },
      { id: '3', minTenorMonths: 7, maxTenorMonths: 12, interestRatePercent: 4.0 },
    ] as InterestTierItem[],
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
    if (!canManageProducts) return;
    fetchLoanProductSectors();
  }, [fetchLoanProductSectors, canManageProducts]);

  // If in Edit mode, load product by ID
  useEffect(() => {
    if (!canManageProducts) return;
    if (isEdit && productId) {
      setLoadingData(true);
      fetchLoanProducts().then((products) => {
        const found = products?.find((p: any) => p.id === productId);
        if (found) {
          const rawTiers = Array.isArray(found.interestTiers) && found.interestTiers.length > 0
            ? found.interestTiers
            : [
                { minTenorMonths: found.minimumTenorMonths || 1, maxTenorMonths: found.maximumTenorMonths || 12, interestRatePercent: 3.5 }
              ];
          const mappedTiers: InterestTierItem[] = rawTiers.map((t: any, idx: number) => ({
            id: String(t.id || idx + 1),
            minTenorMonths: Number(t.minTenorMonths) || 1,
            maxTenorMonths: Number(t.maxTenorMonths) || 12,
            interestRatePercent: Number(t.interestRatePercent) || 0
          }));

          setForm({
            productName: found.productName || '',
            productCode: found.productCode || '',
            sectors: found.sectors || [],
            minimumAmount: Number(found.minimumAmount) || 0,
            maximumAmount: Number(found.maximumAmount) || 0,
            minimumTenorMonths: Number(found.minimumTenorMonths) || 1,
            maximumTenorMonths: Number(found.maximumTenorMonths) || 12,
            interestTiers: mappedTiers,
            minimumServiceMonthsLeft: found.minimumServiceMonthsLeft !== null ? Number(found.minimumServiceMonthsLeft) : 24,
            maximumMonthsInService: (() => {
              const raw = found.maximumMonthsInService !== null && found.maximumMonthsInService !== undefined ? Number(found.maximumMonthsInService) : 420;
              return raw > 50 ? Math.round(raw / 12) : raw || 35;
            })(),
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

  // Tier Handlers
  const handleAddTier = () => {
    const tiers = form.interestTiers;
    const lastTier = tiers[tiers.length - 1];
    const nextMin = lastTier ? Number(lastTier.maxTenorMonths) + 1 : 1;
    const nextMax = nextMin + 2; // e.g. 3-month band
    const nextRate = lastTier ? Number(lastTier.interestRatePercent) : 3.5;
    const newTier: InterestTierItem = {
      id: Math.random().toString(36).substring(2, 9),
      minTenorMonths: nextMin,
      maxTenorMonths: nextMax,
      interestRatePercent: nextRate
    };
    const updated = [...tiers, newTier];
    const highestMax = Math.max(...updated.map(t => Number(t.maxTenorMonths)));
    setForm({
      ...form,
      interestTiers: updated,
      maximumTenorMonths: Math.max(form.maximumTenorMonths, highestMax)
    });
  };

  const handleUpdateTier = (id: string, field: 'minTenorMonths' | 'maxTenorMonths' | 'interestRatePercent', value: number) => {
    const updated = form.interestTiers.map(t => {
      if (t.id === id) {
        return { ...t, [field]: value };
      }
      return t;
    });
    const highestMax = Math.max(...updated.map(t => Number(t.maxTenorMonths) || 1));
    setForm({
      ...form,
      interestTiers: updated,
      maximumTenorMonths: Math.max(form.maximumTenorMonths, highestMax)
    });
  };

  const handleRemoveTier = (id: string) => {
    if (form.interestTiers.length <= 1) {
      return addToast('At least one month range is required', 'warning');
    }
    const updated = form.interestTiers.filter(t => t.id !== id);
    setForm({
      ...form,
      interestTiers: updated
    });
  };

  const handleAutoAlignTiers = () => {
    const current = [...form.interestTiers];
    if (current.length === 0) return;
    let runningMin = Number(form.minimumTenorMonths) || 1;
    const updated = current.map((t) => {
      const span = Math.max(0, Number(t.maxTenorMonths) - Number(t.minTenorMonths));
      const minT = runningMin;
      const maxT = minT + span;
      runningMin = maxT + 1;
      return { ...t, minTenorMonths: minT, maxTenorMonths: maxT };
    });
    const highestMax = Math.max(...updated.map(t => Number(t.maxTenorMonths)));
    setForm({
      ...form,
      interestTiers: updated,
      maximumTenorMonths: Math.max(form.maximumTenorMonths, highestMax)
    });
    addToast('Tenor ranges aligned contiguously without gaps', 'success');
  };

  const coverageStatus = useMemo(() => {
    const tiers = form.interestTiers;
    if (!tiers || tiers.length === 0) {
      return { isContiguous: false, text: 'No ranges defined' };
    }
    const minT = Number(form.minimumTenorMonths) || 1;
    const maxT = Number(form.maximumTenorMonths) || 12;

    if (Number(tiers[0].minTenorMonths) !== minT) {
      return { isContiguous: false, text: `Starts at ${tiers[0].minTenorMonths}M (expected ${minT}M)` };
    }

    for (let i = 1; i < tiers.length; i++) {
      const prevMax = Number(tiers[i - 1].maxTenorMonths);
      const currMin = Number(tiers[i].minTenorMonths);
      if (currMin > prevMax + 1) {
        return { isContiguous: false, text: `Gap: Month ${prevMax + 1} to ${currMin - 1} unassigned` };
      }
      if (currMin <= prevMax) {
        return { isContiguous: false, text: `Overlap between Band ${i} and Band ${i + 1}` };
      }
    }

    const lastMax = Number(tiers[tiers.length - 1].maxTenorMonths);
    if (lastMax < maxT) {
      return { isContiguous: false, text: `Covers up to ${lastMax}M (${maxT}M max tenor)` };
    }

    return { isContiguous: true, text: `Continuous coverage: 1 to ${lastMax} months` };
  }, [form.interestTiers, form.minimumTenorMonths, form.maximumTenorMonths]);

  const nextSuggestedRange = useMemo(() => {
    const lastTier = form.interestTiers[form.interestTiers.length - 1];
    if (!lastTier) return { min: 1, max: 3 };
    const min = Number(lastTier.maxTenorMonths) + 1;
    const max = min + 2;
    return { min, max };
  }, [form.interestTiers]);

  const applyPreset = (preset: 'short' | 'quarterly' | 'biannual' | 'flat') => {
    if (preset === 'short') {
      // 1-3, 4-6, 7-12
      setForm({
        ...form,
        minimumTenorMonths: 1,
        maximumTenorMonths: 12,
        interestTiers: [
          { id: '1', minTenorMonths: 1, maxTenorMonths: 3, interestRatePercent: 3.0 },
          { id: '2', minTenorMonths: 4, maxTenorMonths: 6, interestRatePercent: 3.5 },
          { id: '3', minTenorMonths: 7, maxTenorMonths: 12, interestRatePercent: 4.0 }
        ]
      });
    } else if (preset === 'quarterly') {
      // 1-3, 4-6, 7-9, 10-12
      setForm({
        ...form,
        minimumTenorMonths: 1,
        maximumTenorMonths: 12,
        interestTiers: [
          { id: '1', minTenorMonths: 1, maxTenorMonths: 3, interestRatePercent: 3.0 },
          { id: '2', minTenorMonths: 4, maxTenorMonths: 6, interestRatePercent: 3.25 },
          { id: '3', minTenorMonths: 7, maxTenorMonths: 9, interestRatePercent: 3.5 },
          { id: '4', minTenorMonths: 10, maxTenorMonths: 12, interestRatePercent: 4.0 }
        ]
      });
    } else if (preset === 'biannual') {
      // 6-12, 13-18, 19-24, 25-30
      setForm({
        ...form,
        minimumTenorMonths: 6,
        maximumTenorMonths: 30,
        interestTiers: [
          { id: '1', minTenorMonths: 6, maxTenorMonths: 12, interestRatePercent: 3.5 },
          { id: '2', minTenorMonths: 13, maxTenorMonths: 18, interestRatePercent: 3.5 },
          { id: '3', minTenorMonths: 19, maxTenorMonths: 24, interestRatePercent: 3.5 },
          { id: '4', minTenorMonths: 25, maxTenorMonths: 30, interestRatePercent: 3.5 }
        ]
      });
    } else if (preset === 'flat') {
      setForm({
        ...form,
        interestTiers: [
          {
            id: '1',
            minTenorMonths: form.minimumTenorMonths || 1,
            maxTenorMonths: form.maximumTenorMonths || 12,
            interestRatePercent: form.interestTiers[0]?.interestRatePercent || 3.5
          }
        ]
      });
    }
    addToast('Applied tenor month preset template', 'info');
  };

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

    if (!form.interestTiers || form.interestTiers.length === 0) {
      return addToast('Please configure at least one tenor month range', 'error');
    }

    for (let i = 0; i < form.interestTiers.length; i++) {
      const t = form.interestTiers[i];
      if (t.minTenorMonths <= 0 || t.maxTenorMonths <= 0) {
        return addToast(`Band ${i + 1} has an invalid month range`, 'error');
      }
      if (Number(t.maxTenorMonths) < Number(t.minTenorMonths)) {
        return addToast(`Band ${i + 1}: max month (${t.maxTenorMonths}) cannot be less than min month (${t.minTenorMonths})`, 'error');
      }
      if (Number(t.interestRatePercent) < 0) {
        return addToast(`Band ${i + 1}: interest rate cannot be negative`, 'error');
      }
    }

    const minT = Number(form.minimumTenorMonths);
    const maxT = Number(form.maximumTenorMonths);
    
    const interestTiers = form.interestTiers.map(t => ({
      minTenorMonths: Number(t.minTenorMonths),
      maxTenorMonths: Number(t.maxTenorMonths),
      interestRatePercent: Number(t.interestRatePercent) || 0
    }));

    const payload = {
      productName: form.productName.trim(),
      productCode: form.productCode.trim().toUpperCase(),
      sectors: form.sectors,
      minimumAmount: Number(form.minimumAmount),
      maximumAmount: Number(form.maximumAmount),
      minimumTenorMonths: minT,
      maximumTenorMonths: maxT,
      interestTiers,
      tier1Rate: interestTiers[0]?.interestRatePercent || 0,
      managementChargeType: form.managementChargeType,
      managementChargeValue: Number(form.managementChargeValue) || 0,
      managementChargeApplication: form.managementChargeApplication,
      minimumServiceMonthsLeft: Number(form.minimumServiceMonthsLeft),
      maximumMonthsInService: Number(form.maximumMonthsInService) * 12
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

  if (!canManageProducts) {
    return (
      <div className="p-8">
        <EmptyState
          title="Access Restricted"
          description="You do not have permission to create or edit loan products."
        />
      </div>
    );
  }

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
                    <SelectItem key={m} value={String(m)}>{m === 1 ? '1 month' : `${m} months`}</SelectItem>
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
                    <SelectItem key={m} value={String(m)}>{m === 1 ? '1 month' : `${m} months`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dynamic Interest Rate Matrix */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground">Interest Rate Matrix</h3>
                  <span className="text-[11px] font-semibold text-[#018752] bg-[#E8F5EE] px-2.5 py-0.5 rounded-full">
                    {activeSectorName}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Define contiguous month ranges and the monthly interest percentage applied to each tenor band.
                </p>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1 mr-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#018752]" /> Presets:
                </span>
                <button
                  type="button"
                  onClick={() => applyPreset('short')}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-muted/60 hover:bg-muted text-foreground border border-border/70 hover:border-[#018752]/50 transition-all cursor-pointer shadow-2xs"
                >
                  1-3M, 4-6M, 7-12M
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('quarterly')}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-muted/60 hover:bg-muted text-foreground border border-border/70 hover:border-[#018752]/50 transition-all cursor-pointer shadow-2xs"
                >
                  Quarterly
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('biannual')}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-muted/60 hover:bg-muted text-foreground border border-border/70 hover:border-[#018752]/50 transition-all cursor-pointer shadow-2xs"
                >
                  6-12M, 13-18M, 19-24M
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('flat')}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-muted/60 hover:bg-muted text-foreground border border-border/70 hover:border-[#018752]/50 transition-all cursor-pointer shadow-2xs"
                >
                  Flat Rate
                </button>
              </div>
            </div>

            {/* Enterprise Rate Schedule Card */}
            <div className="border border-border/80 rounded-2xl bg-card shadow-xs overflow-hidden">
              {/* Visual Tenor Ribbon */}
              <div className="p-3.5 bg-muted/20 border-b border-border/60 space-y-2">
                <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <CalendarRange className="w-3.5 h-3.5 text-[#018752]" />
                    Tenor Continuum & Distribution
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Product Range: <strong className="text-foreground">{form.minimumTenorMonths} – {form.maximumTenorMonths} months</strong>
                    </span>
                    {coverageStatus.isContiguous ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Fully Contiguous
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleAutoAlignTiers}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300 px-2.5 py-0.5 rounded-full hover:bg-amber-200 transition-colors cursor-pointer"
                        title="Click to automatically close gaps and align ranges"
                      >
                        <Sparkles className="w-3 h-3" /> {coverageStatus.text} • Click to Auto-align
                      </button>
                    )}
                  </div>
                </div>

                {/* Segmented Timeline Bar */}
                <div className="h-8 w-full bg-muted/60 rounded-xl overflow-hidden p-1 flex gap-1 border border-border/60">
                  {form.interestTiers.map((tier, idx) => {
                    const spanMonths = Math.max(1, Number(tier.maxTenorMonths) - Number(tier.minTenorMonths) + 1);
                    const totalSpan = Math.max(
                      Number(form.maximumTenorMonths) || 12,
                      ...form.interestTiers.map(t => Number(t.maxTenorMonths) || 12)
                    );
                    const widthPercent = Math.max(8, (spanMonths / totalSpan) * 100);

                    const palette = [
                      'bg-[#018752] text-white',
                      'bg-[#02975c] text-white',
                      'bg-[#0aa668] text-white',
                      'bg-[#12b575] text-white',
                      'bg-[#1cc481] text-white',
                    ];
                    const colorClass = palette[idx % palette.length];

                    return (
                      <div
                        key={tier.id || idx}
                        style={{ flex: `${widthPercent} 1 0%` }}
                        className={cn(
                          'h-full rounded-lg flex items-center justify-between px-2 text-[11px] font-bold shadow-2xs transition-all relative overflow-hidden group min-w-[70px]',
                          colorClass
                        )}
                        title={`Band ${idx + 1}: Months ${tier.minTenorMonths} to ${tier.maxTenorMonths} (${tier.interestRatePercent}%/mo)`}
                      >
                        <span className="truncate">
                          Band {idx + 1}: {tier.minTenorMonths}–{tier.maxTenorMonths}M
                        </span>
                        <span className="text-[10px] font-mono opacity-90 shrink-0 ml-1 bg-black/15 px-1 rounded">
                          {tier.interestRatePercent}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Table of Tenor Bands */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border/70 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="py-3 px-3 w-20 whitespace-nowrap">Band</th>
                      <th className="py-3 px-3 min-w-[220px]">Tenor Range</th>
                      <th className="py-3 px-3 w-24">Duration</th>
                      <th className="py-3 px-3 w-32">Monthly Rate</th>
                      <th className="py-3 px-3 w-28 whitespace-nowrap">APR (p.a.)</th>
                      <th className="py-3 px-3 text-right w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 bg-card">
                    {form.interestTiers.map((tier, idx) => {
                      const spanMonths = Math.max(1, Number(tier.maxTenorMonths) - Number(tier.minTenorMonths) + 1);
                      const apr = (Number(tier.interestRatePercent || 0) * 12).toFixed(1);

                      return (
                        <tr 
                          key={tier.id || idx}
                          className="hover:bg-muted/20 transition-colors group"
                        >
                          {/* Band Column */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#018752] shrink-0" />
                              <span>Band {idx + 1}</span>
                            </div>
                          </td>

                          {/* Connected Range Inputs */}
                          <td className="py-3 px-3">
                            <div className="inline-flex items-center gap-1.5 bg-muted/20 hover:bg-muted/40 border border-border/80 focus-within:border-[#018752] focus-within:bg-background focus-within:ring-2 focus-within:ring-[#018752]/10 rounded-xl px-2.5 py-1 transition-all">
                              <span className="text-[11px] text-muted-foreground font-medium">Month</span>
                              <input
                                type="number"
                                min={1}
                                value={tier.minTenorMonths}
                                onChange={(e) => handleUpdateTier(tier.id, 'minTenorMonths', Math.max(1, Number(e.target.value)))}
                                className="w-11 h-7 text-center font-bold text-xs bg-background border border-border/80 rounded-lg text-foreground outline-none focus:border-[#018752]"
                              />

                              <ArrowRight className="w-3 h-3 text-muted-foreground/60 shrink-0" />

                              <span className="text-[11px] text-muted-foreground font-medium">Month</span>
                              <input
                                type="number"
                                min={tier.minTenorMonths}
                                value={tier.maxTenorMonths}
                                onChange={(e) => handleUpdateTier(tier.id, 'maxTenorMonths', Math.max(Number(tier.minTenorMonths), Number(e.target.value)))}
                                className="w-11 h-7 text-center font-bold text-xs bg-background border border-border/80 rounded-lg text-foreground outline-none focus:border-[#018752]"
                              />
                            </div>
                          </td>

                          {/* Span Duration */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#E8F5EE] text-[#018752] dark:bg-emerald-950/40 dark:text-emerald-300 border border-[#018752]/20">
                              {spanMonths} {spanMonths === 1 ? 'mo' : 'mos'}
                            </span>
                          </td>

                          {/* Rate Input */}
                          <td className="py-3 px-3">
                            <div className="inline-flex items-center gap-1 bg-muted/20 hover:bg-muted/40 border border-border/80 focus-within:border-[#018752] focus-within:bg-background focus-within:ring-2 focus-within:ring-[#018752]/10 rounded-xl px-2.5 py-1 transition-all w-28">
                              <input
                                type="number"
                                step="0.05"
                                min={0}
                                value={tier.interestRatePercent}
                                onChange={(e) => handleUpdateTier(tier.id, 'interestRatePercent', Number(e.target.value))}
                                className="w-full text-right font-bold text-xs text-[#018752] bg-transparent outline-none"
                              />
                              <span className="text-[11px] font-bold text-muted-foreground shrink-0">% / mo</span>
                            </div>
                          </td>

                          {/* Annualized APR */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="text-xs font-semibold text-muted-foreground font-mono">
                              {apr}%
                            </span>
                          </td>

                          {/* Action Button */}
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              disabled={form.interestTiers.length <= 1}
                              onClick={() => handleRemoveTier(tier.id)}
                              className="p-1 text-muted-foreground/70 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
                              title="Remove this band"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Footer Actions */}
              <div className="p-3 bg-muted/20 border-t border-border flex items-center justify-between flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleAddTier}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-[#018752] hover:text-[#018752]/90 bg-[#E8F5EE] hover:bg-[#E8F5EE]/80 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  Add Next Tenor Band ({nextSuggestedRange.min}–{nextSuggestedRange.max} mos)
                </button>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Total bands: <strong className="text-foreground">{form.interestTiers.length}</strong></span>
                  {!coverageStatus.isContiguous && (
                    <button
                      type="button"
                      onClick={handleAutoAlignTiers}
                      className="inline-flex items-center gap-1 text-[#018752] hover:underline font-semibold cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Auto-align ranges
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Information Banner */}
            <div className="flex items-start gap-2.5 p-3.5 bg-[#E8F5EE]/70 dark:bg-emerald-950/20 border border-[#018752]/20 rounded-2xl">
              <Info className="w-4 h-4 text-[#018752] shrink-0 mt-0.5" />
              <p className="text-xs text-[#018752] dark:text-emerald-300 leading-relaxed font-medium">
                Rate type is fixed for the life of the loan. Tenors outside the defined month bands are automatically rejected upon applicant submission.
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
                      <SelectItem key={y} value={String(y)}>{y} years ({y * 12} months)</SelectItem>
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
                <div className="text-xs text-muted-foreground font-medium mb-1">Tenor Range</div>
                <div className="text-sm font-semibold text-foreground">
                  {form.minimumTenorMonths} – {form.maximumTenorMonths} months
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground font-medium mb-1.5 flex items-center justify-between">
                  <span>Interest Rate Matrix</span>
                  <span className="text-[10px] text-[#018752] font-semibold">{form.interestTiers.length} {form.interestTiers.length === 1 ? 'band' : 'bands'}</span>
                </div>
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {form.interestTiers.map((t, idx) => (
                    <div 
                      key={t.id || idx}
                      className="flex items-center justify-between px-3 py-1.5 bg-white/70 dark:bg-card/70 border border-[#018752]/20 rounded-xl text-xs"
                    >
                      <span className="font-medium text-foreground">
                        {t.minTenorMonths === t.maxTenorMonths ? `${t.minTenorMonths} month` : `${t.minTenorMonths} – ${t.maxTenorMonths} months`}
                      </span>
                      <span className="font-bold text-[#018752]">
                        {t.interestRatePercent}% / mo
                      </span>
                    </div>
                  ))}
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
