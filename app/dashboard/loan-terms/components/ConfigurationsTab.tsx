"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLoans } from '@/app/composables/modules/useLoans';
import { useToast } from '@/app/composables/useToast';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { 
  Filter, 
  Plus, 
  Pencil, 
  Settings as SettingsIcon, 
  X
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/Select';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';

const SECTOR_OPTIONS = [
  { code: 'NPF', name: 'Nigerian Police Force' },
  { code: 'LASG', name: 'Lagos State Civil Service' },
  { code: 'IPPIS', name: 'Federal Civil Service (IPPIS)' },
  { code: 'NSCDC', name: 'Military & Paramilitary' },
  { code: 'IMMIGRATION', name: 'Nigeria Immigration Service' },
  { code: 'CORRECTIONAL', name: 'Nigerian Correctional Service' },
  { code: 'CUSTOM', name: 'Nigeria Customs Service' }
];

export default function ConfigurationsTab() {
  const { isSuperAdmin, hasPermission } = useAdminPermissions();
  const canManageProducts = isSuperAdmin || hasPermission('loan-products:manage');
  const canManageSettings = isSuperAdmin || hasPermission('loan-settings:manage');
  const router = useRouter();
  const { 
    loading, 
    error, 
    loanProducts, 
    loanProductSectors,
    loanSettings,
    fetchLoanProducts, 
    fetchLoanProductSectors,
    fetchLoanSettings,
    updateLoanSettings
  } = useLoans();

  const { addToast } = useToast();

  // Filters & Search
  const [showFilters, setShowFilters] = useState(false);
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    retirementAgeYears: 60,
    maxServiceYears: 35
  });

  const [submitting, setSubmitting] = useState(false);

  // Load initial products, sectors, and settings
  useEffect(() => {
    if (canManageProducts) {
      fetchLoanProducts();
      fetchLoanProductSectors();
    }
    if (canManageSettings) {
      fetchLoanSettings().then(res => {
        if (res) {
          setSettingsForm({
            retirementAgeYears: res.retirementAgeYears || 60,
            maxServiceYears: res.maxServiceYears || 35
          });
        }
      });
    }
  }, [fetchLoanProducts, fetchLoanProductSectors, fetchLoanSettings, canManageProducts, canManageSettings]);

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

  // Filtered Products
  const filteredProducts = useMemo(() => {
    if (!loanProducts || !Array.isArray(loanProducts)) return [];
    return loanProducts.filter((p: any) => {
      if (sectorFilter !== 'all') {
        const pSectors = p.sectors || [];
        if (!pSectors.includes(sectorFilter)) return false;
      }
      if (statusFilter === 'active' && p.isActive === false) return false;
      if (statusFilter === 'inactive' && p.isActive !== false) return false;
      return true;
    });
  }, [loanProducts, sectorFilter, statusFilter]);

  // Navigate to Standalone Create Page
  const handleOpenCreate = () => {
    router.push('/dashboard/loan-products/new');
  };

  // Navigate to Standalone Edit Page
  const handleOpenEdit = (product: any) => {
    router.push(`/dashboard/loan-products/new?id=${product.id}`);
  };

  // Save Loan Settings
  const handleSaveSettings = async () => {
    setSubmitting(true);
    try {
      await updateLoanSettings({
        retirementAgeYears: Number(settingsForm.retirementAgeYears),
        maxServiceYears: Number(settingsForm.maxServiceYears)
      });
      addToast('Loan settings updated successfully', 'success');
      setShowSettingsModal(false);
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to update loan settings', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Format Helper for Currency
  const formatNaira = (val: number | string) => {
    const num = Number(val) || 0;
    return `₦${num.toLocaleString()}`;
  };

  // Sector name helper
  const getSectorLabel = (sectors?: string[]) => {
    if (!sectors || sectors.length === 0) return 'All Sectors';
    return sectors
      .map(s => {
        const found = availableSectors.find(item => item.code === s);
        return found ? found.name : s;
      })
      .join(', ');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header bar with Action Buttons (Matches Image 3) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="sr-only">Loan Products</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage public sector lending tiers, interest matrices, and department eligibility rules.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {canManageSettings && (
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border text-foreground hover:bg-muted text-sm font-medium transition-colors"
            >
              <SettingsIcon className="w-4 h-4 text-muted-foreground" />
              Statutory Settings
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-colors ${
              showFilters 
                ? 'border-[#018752] text-[#018752] bg-[#E8F5EE]' 
                : 'border-border text-foreground hover:bg-muted'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>

          {canManageProducts && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#018752] hover:bg-[#017044] text-white rounded-full text-sm font-semibold transition-all shadow-sm hover:shadow active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add New Products
            </button>
          )}
        </div>
      </div>

      {/* Filter Popover / Bar */}
      {showFilters && (
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Filter by Sector
            </label>
            <Select value={sectorFilter} onValueChange={(val) => setSectorFilter(val)}>
              <SelectTrigger className="w-full h-10 bg-muted/40 border-border rounded-xl text-sm">
                <SelectValue placeholder="All Eligible Sectors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Eligible Sectors</SelectItem>
                {availableSectors.map(s => (
                  <SelectItem key={s.code} value={s.code}>{s.name} ({s.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Filter by Status
            </label>
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
              <SelectTrigger className="w-full h-10 bg-muted/40 border-border rounded-xl text-sm">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent hideSearch>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="self-end pt-1">
            <button
              type="button"
              onClick={() => { setSectorFilter('all'); setStatusFilter('all'); }}
              className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Loading / Error States */}
      {loading && (
        <div className="py-12 flex justify-center">
          <PulseLoader />
        </div>
      )}

      {!loading && error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Products Table (Matches Image 3) */}
      {!loading && canManageProducts && (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="py-3.5 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="py-3.5 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Product Code
                  </th>
                  <th className="py-3.5 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Eligible Sectors
                  </th>
                  <th className="py-3.5 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Amount Range
                  </th>
                  <th className="py-3.5 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Tenor Band
                  </th>
                  <th className="py-3.5 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Last Updated
                  </th>
                  {canManageProducts && (
                    <th className="py-3.5 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={canManageProducts ? 7 : 6} className="py-12">
                      <EmptyState 
                        title="No Loan Products Found" 
                        description={
                          sectorFilter !== 'all' || statusFilter !== 'all'
                            ? "No loan products match the selected filters."
                            : "Click 'Add New Products' to set up institutional lending tiers."
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product: any) => {
                    const updatedDate = product.updatedAt 
                      ? new Date(product.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                      : 'Recently';

                    return (
                      <tr 
                        key={product.id || product.productCode} 
                        className="hover:bg-muted/40 transition-colors group"
                      >
                        <td className="py-4 px-6 font-semibold text-sm text-foreground">
                          {product.productName}
                        </td>
                        <td className="py-4 px-6 text-sm font-mono text-muted-foreground">
                          {product.productCode}
                        </td>
                        <td className="py-4 px-6 text-sm text-foreground/80">
                          {getSectorLabel(product.sectors)}
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-foreground">
                          {formatNaira(product.minimumAmount)} - {formatNaira(product.maximumAmount)}
                        </td>
                        <td className="py-4 px-6 text-sm text-foreground/80">
                          {product.minimumTenorMonths}-{product.maximumTenorMonths} months
                        </td>
                        <td className="py-4 px-6 text-sm text-muted-foreground whitespace-nowrap">
                          {updatedDate}
                        </td>
                        {canManageProducts && (
                          <td className="py-4 px-6 text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(product)}
                              className="p-2 text-muted-foreground hover:text-[#018752] hover:bg-[#E8F5EE] rounded-lg transition-colors"
                              title="Edit Product"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Global Loan Settings Modal */}
      {canManageSettings && showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowSettingsModal(false)}
          />
          <div className="relative bg-card rounded-3xl p-6 sm:p-8 w-full max-w-md border border-border shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Global Loan Settings</h3>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              These statutory limits govern loan eligibility rules across all sectors and departments.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Retirement Age (Years)
                </label>
                <Select
                  value={String(settingsForm.retirementAgeYears)}
                  onValueChange={(val) => setSettingsForm({ ...settingsForm, retirementAgeYears: Number(val) })}
                >
                  <SelectTrigger className="w-full h-10 bg-muted/30 border-border rounded-xl text-sm font-medium">
                    <SelectValue placeholder="Select retirement age" />
                  </SelectTrigger>
                  <SelectContent hideSearch>
                    {[50, 55, 60, 65, 70].map(age => (
                      <SelectItem key={age} value={String(age)}>
                        {age} years {age === 60 ? '(Public Service Standard)' : age === 65 ? '(Professors / Judges)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Maximum Service (Years)
                </label>
                <Select
                  value={String(settingsForm.maxServiceYears)}
                  onValueChange={(val) => setSettingsForm({ ...settingsForm, maxServiceYears: Number(val) })}
                >
                  <SelectTrigger className="w-full h-10 bg-muted/30 border-border rounded-xl text-sm font-medium">
                    <SelectValue placeholder="Select maximum service years" />
                  </SelectTrigger>
                  <SelectContent hideSearch>
                    {[25, 30, 35, 40].map(yrs => (
                      <SelectItem key={yrs} value={String(yrs)}>
                        {yrs} years {yrs === 35 ? '(Public Service Standard)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-border hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={submitting}
                className="px-6 py-2 text-sm font-semibold rounded-xl bg-[#018752] hover:bg-[#017044] text-white"
              >
                {submitting ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
