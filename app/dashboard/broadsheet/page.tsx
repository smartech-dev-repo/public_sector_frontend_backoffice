"use client";

import { auditLogs_api } from '@/app/api_factory/modules/auditLogs';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useToast } from '@/app/composables/useToast';
import EmptyState from '@/app/components/ui/EmptyState';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';
import UploadWizardModal from './components/UploadWizardModal';
import UploadFilters from './components/UploadFilters';
import UploadHistoryColumn from './components/UploadHistoryColumn';
import { EMPTY_FILTERS, exportUploads } from './components/uploadBatches';

const EXPORT_OPTIONS = [
  { label: 'IPPIS Broadsheet uploads', fileLabel: 'ippis-broadsheet', documentTypes: ['IPPIS_BROADSHEET'] },
  { label: 'Repayment Schedule uploads', fileLabel: 'repayment-schedule', documentTypes: ['REPAYMENT_SCHEDULE'] },
  { label: 'All uploads', fileLabel: 'all', documentTypes: ['IPPIS_BROADSHEET', 'REPAYMENT_SCHEDULE'] },
];

export default function BroadsheetPage() {
  const { isSuperAdmin, hasPermission } = useAdminPermissions();
  const canUploadIppis = isSuperAdmin || hasPermission('ippis:upload');
  const canUploadRepayments = isSuperAdmin || hasPermission('repayments:upload');
  const canReadDocuments = isSuperAdmin || hasPermission('documents:read');

  const { addToast } = useToast();
  const [wizard, setWizard] = useState<{ documentType: string; resumeBatchId?: string } | null>(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [refreshKey, setRefreshKey] = useState(0);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!exportRef.current?.contains(event.target as Node)) setExportOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (option: (typeof EXPORT_OPTIONS)[number]) => {
    setExportOpen(false);
    setExporting(true);
    try {
      const count = await exportUploads(option.documentTypes, option.fileLabel, filters);
      if (count > 0) auditLogs_api.reportDataAccess({ kind: 'export', resource: option.label, recordCount: count });
      addToast(count > 0 ? `Exported ${count.toLocaleString()} ${option.label}` : 'No uploads match these filters', count > 0 ? 'success' : 'error');
    } catch {
      addToast('The export failed. Please try again.', 'error');
    } finally {
      setExporting(false);
    }
  };

  if (!canUploadIppis && !canUploadRepayments && !canReadDocuments) {
    return (
      <div className="p-8">
        <EmptyState
          title="Access Restricted"
          description="You do not have permission to view or upload IPPIS broadsheets or Repayment schedules."
        />
      </div>
    );
  }

  const showIppis = (canUploadIppis || canReadDocuments) && filters.report !== 'REPAYMENT_SCHEDULE';
  const showRepayments = (canUploadRepayments || canReadDocuments) && filters.report !== 'IPPIS_BROADSHEET';
  const visibleTotal = (showIppis ? totals.IPPIS_BROADSHEET ?? 0 : 0) + (showRepayments ? totals.REPAYMENT_SCHEDULE ?? 0 : 0);

  return (
    <div className="space-y-4">
      <UploadWizardModal
        isOpen={Boolean(wizard)}
        onClose={() => setWizard(null)}
        onChanged={() => setRefreshKey((key) => key + 1)}
        documentType={wizard?.documentType ?? 'IPPIS_BROADSHEET'}
        resumeBatchId={wizard?.resumeBatchId}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs sm:text-sm text-muted-foreground/70">
          {canReadDocuments ? `Showing ${visibleTotal.toLocaleString()} uploads` : 'Upload a broadsheet or repayment schedule'}
        </span>
        {canReadDocuments && (
          <div ref={exportRef} className="relative">
            <button
              onClick={() => setExportOpen(!exportOpen)}
              disabled={exporting}
              aria-haspopup="menu"
              aria-expanded={exportOpen}
              className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm font-medium text-foreground/90 hover:bg-muted/30 transition-colors disabled:opacity-60"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              {exporting ? 'Exporting...' : 'Export as Excel'}
              <ChevronDown className={`w-4 h-4 transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
            </button>
            {exportOpen && (
              <div role="menu" className="absolute right-0 z-20 mt-2 w-64 bg-card border border-border rounded-xl shadow-lg p-1.5">
                <p className="px-3 py-1.5 text-[11px] text-muted-foreground">Which report? Your current filters apply.</p>
                {EXPORT_OPTIONS.map((option) => (
                  <button
                    key={option.fileLabel}
                    role="menuitem"
                    onClick={() => handleExport(option)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted/50 transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {canReadDocuments && <UploadFilters value={filters} onChange={setFilters} />}

      <div className={`grid grid-cols-1 ${showIppis && showRepayments ? 'lg:grid-cols-2' : ''} gap-6 items-start`}>
        {showIppis && (
          <UploadHistoryColumn
            title="IPPIS Broadsheet"
            documentType="IPPIS_BROADSHEET"
            filters={filters}
            refreshKey={refreshKey}
            canUpload={canUploadIppis}
            canRead={canReadDocuments}
            onUpload={() => setWizard({ documentType: 'IPPIS_BROADSHEET' })}
            onReview={(resumeBatchId) => setWizard({ documentType: 'IPPIS_BROADSHEET', resumeBatchId })}
            onTotal={(total) => setTotals((current) => ({ ...current, IPPIS_BROADSHEET: total }))}
          />
        )}
        {showRepayments && (
          <UploadHistoryColumn
            title="Repayment Schedule"
            documentType="REPAYMENT_SCHEDULE"
            filters={filters}
            refreshKey={refreshKey}
            canUpload={canUploadRepayments}
            canRead={canReadDocuments}
            onUpload={() => setWizard({ documentType: 'REPAYMENT_SCHEDULE' })}
            onReview={(resumeBatchId) => setWizard({ documentType: 'REPAYMENT_SCHEDULE', resumeBatchId })}
            onTotal={(total) => setTotals((current) => ({ ...current, REPAYMENT_SCHEDULE: total }))}
          />
        )}
      </div>
    </div>
  );
}
