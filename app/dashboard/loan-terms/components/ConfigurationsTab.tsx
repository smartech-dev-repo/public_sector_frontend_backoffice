"use client";

import { useDataVersion } from '@/app/composables/useDataVersion';
import FilterBar from '@/app/components/ui/FilterBar';
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
  { code: 'CUSTOMS', name: 'Nigeria Customs Service' }
];

export default function ConfigurationsTab() {
 const dataVersion = useDataVersion();
  const { isSuperAdmin, hasPermission } = useAdminPermissions();
  const canManageProducts = isSuperAdmin || hasPermission('loan-products:manage');
  const router = useRouter();
  const { 
    loading, 
    error, 
    loanProducts, 
    loanProductSectors,
    fetchLoanProducts, 
    fetchLoanProductSectors
  } = useLoans();

  const { addToast } = useToast();

  // Filters & Search
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');


  const [submitting, setSubmitting] = useState(false);

  // Load initial products, sectors, and settings
  useEffect(() => {
    if (canManageProducts) {
      fetchLoanProducts({ limit: 100 });
      fetchLoanProductSectors();
    }
  }, [fetchLoanProducts, fetchLoanProductSectors, canManageProducts, dataVersion]);

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
      <FilterBar
       filters={[
        { key: 'sector', label: 'Sector', type: 'select', value: sectorFilter, emptyValue: 'all', options: availableSectors.map((s) => ({ value: s.code, label: `${s.name} (${s.code})` })), onChange: setSectorFilter },
        { key: 'status', label: 'Status', type: 'select', value: statusFilter, emptyValue: 'all', options: [{ value: 'active', label: 'Active Only' }, { value: 'inactive', label: 'Inactive Only' }], onChange: setStatusFilter },
       ]}
      />

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

    </div>
  );
}
