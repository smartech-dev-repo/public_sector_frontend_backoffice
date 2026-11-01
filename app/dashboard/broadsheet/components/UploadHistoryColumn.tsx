"use client";

import { useDataVersion } from '@/app/composables/useDataVersion';
import { useEffect, useRef, useState } from 'react';
import { Download, UploadCloud } from 'lucide-react';
import EmptyState from '@/app/components/ui/EmptyState';
import PulseLoader from '@/app/components/ui/PulseLoader';
import { ippis_api } from '@/app/api_factory/modules/ippis';
import { useToast } from '@/app/composables/useToast';
import { buildBatchParams, formatPeriod, formatUploadedOn, STATUS_LABELS, type UploadFilterValues } from './uploadBatches';

const PAGE_SIZE = 25;

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  AWAITING_CONFIRMATION: 'bg-amber-50 text-amber-700 border-amber-100',
  FAILED: 'bg-rose-50 text-rose-700 border-rose-100',
  CANCELLED: 'bg-muted text-muted-foreground border-border',
};

interface UploadHistoryColumnProps {
  title: string;
  documentType: string;
  filters: UploadFilterValues;
  refreshKey: number;
  canUpload: boolean;
  canRead: boolean;
  onUpload: () => void;
  onReview: (batchId: string) => void;
  onTotal: (total: number) => void;
}

export default function UploadHistoryColumn({ title, documentType, filters, refreshKey, canUpload, canRead, onUpload, onReview, onTotal }: UploadHistoryColumnProps) {
 const dataVersion = useDataVersion();
  const { addToast } = useToast();
  const [batches, setBatches] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const requestRef = useRef(0);

  const load = async (nextPage: number) => {
    const request = ++requestRef.current;
    setLoading(true);
    const res: any = await ippis_api.getDocumentBatches({ ...buildBatchParams(documentType, filters), page: nextPage, limit: PAGE_SIZE });
    // A newer filter has been applied while this one was in flight.
    if (request !== requestRef.current) return;
    setLoading(false);
    if (res?.type === 'ERROR') return;

    const data = res.data?.data ?? [];
    setBatches((current) => (nextPage === 1 ? data : [...current, ...data]));
    setPage(nextPage);
    setTotalPages(res.data?.meta?.totalPages ?? 1);
    onTotal(res.data?.meta?.total ?? 0);
  };

  useEffect(() => {
    if (canRead) load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canRead, filters, refreshKey, dataVersion]);

  // The API returns a signed URL on cloud storage, and a path ending in the file key on local storage.
  const handleDownload = async (batch: any) => {
    if (!batch.fileUrl) return addToast('No file available for download', 'error');
    if (/^https?:/.test(batch.fileUrl)) {
      window.open(batch.fileUrl, '_blank', 'noopener');
      return;
    }

    const res: any = await ippis_api.downloadDocumentFile(decodeURIComponent(batch.fileUrl.split('/files/')[1] ?? ''));
    if (res?.type === 'ERROR') return;
    const url = window.URL.createObjectURL(res.data);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = batch.storedFileName || batch.originalFileName;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-card rounded-xl border border-border/50 p-6 flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>

      {canUpload && (
        <button type="button" onClick={onUpload} className="w-full border border-dashed border-emerald-300 rounded-xl p-8 flex flex-col items-center text-center bg-emerald-50/30 dark:bg-emerald-950/10 hover:bg-emerald-50/50 transition-colors group">
          <UploadCloud className="w-6 h-6 text-muted-foreground/70 mb-3 group-hover:text-emerald-600 transition-colors" />
          <span className="text-sm text-emerald-600 font-medium">Start an upload</span>
          <span className="text-xs text-muted-foreground/70 mt-1">.xlsx or .csv. You will review it before anything is merged.</span>
        </button>
      )}

      {canRead && (
        <div
          className="space-y-4 max-h-[500px] overflow-y-auto pr-2"
          onScroll={(e) => {
            const target = e.currentTarget;
            if (!loading && page < totalPages && target.scrollHeight - target.scrollTop <= target.clientHeight + 50) load(page + 1);
          }}
        >
          {loading && batches.length === 0 && <PulseLoader />}
          {!loading && batches.length === 0 && <EmptyState title="No uploads match these filters." />}
          {batches.map((batch) => (
            <div key={batch.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/50 pb-4 last:border-0 px-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground">{formatPeriod(batch)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_STYLES[batch.status] ?? 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                    {STATUS_LABELS[batch.status] ?? batch.status}
                  </span>
                </div>
                <p className="text-xs text-foreground/80 truncate">{batch.originalFileName}</p>
                <p className="text-xs text-muted-foreground/70">{batch.uploadedBy?.fullName || 'System'} &bull; {formatUploadedOn(batch)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {canUpload && batch.status === 'AWAITING_CONFIRMATION' && (
                  <button onClick={() => onReview(batch.id)} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 rounded-lg text-white text-xs font-medium transition-colors">Review</button>
                )}
                {batch.status !== 'CANCELLED' && (
                  <button onClick={() => handleDownload(batch)} aria-label={`Download ${batch.originalFileName}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white text-xs font-medium transition-colors">
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
