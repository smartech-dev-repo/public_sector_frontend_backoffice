"use client";

import { useEffect, useRef, useState } from 'react';
import { useIppis } from '@/app/composables/modules/useIppis';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';
import { useToast } from '@/app/composables/useToast';
import { useAdminPermissions } from '@/app/composables/useAdminPermissions';
import { Download, Upload, FileText } from 'lucide-react';

export default function IppisPage() {
  const { isSuperAdmin, hasPermission } = useAdminPermissions();
  const canUploadIppis = isSuperAdmin || hasPermission('ippis:upload');
  const canReadDocs = isSuperAdmin || hasPermission('documents:read');
  const { loading, error, batches, fetchBatches, uploadBroadsheet, downloadFile } = useIppis();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (canReadDocs) {
      fetchBatches();
    }
  }, [fetchBatches, canReadDocs]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await uploadBroadsheet(formData);
      addToast('IPPIS document uploaded successfully', 'success');
      fetchBatches();
    } catch (err: any) {
      addToast(err?.message || 'Failed to upload document', 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownload = async (batch: any) => {
    const key = batch.storageKey || batch.fileKey;
    if (!key) {
      addToast('No downloadable file key found for this batch', 'error');
      return;
    }
    setDownloadingId(batch.id);
    try {
      const data = await downloadFile(key);
      const blob = new Blob([data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ippis-batch-${batch.id.substring(0, 8)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      addToast('Document downloaded successfully', 'success');
    } catch (err: any) {
      addToast(err?.message || 'Failed to download document file', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch ((status || '').toUpperCase()) {
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60';
      case 'PROCESSING':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60';
      case 'FAILED':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60';
      default:
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60';
    }
  };

  if (!canUploadIppis && !canReadDocs) {
    return (
      <div className="p-8">
        <EmptyState
          title="Access Restricted"
          description="You do not have permission to upload or view IPPIS documents."
        />
      </div>
    );
  }

  return (
    <main className="w-full space-y-4">
      {canUploadIppis && (
        <div className="flex justify-end items-center mb-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".csv, .xlsx" 
            className="hidden" 
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm shadow-xs"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      )}

      {loading && <PulseLoader />}
      {!loading && error && canReadDocs && <div className="text-red-500 py-12 text-center">{error}</div>}
      
      {!loading && !error && canReadDocs && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-[#E9F4EE] dark:bg-emerald-950/20">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Date Created</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Period</th>
                  <th className="px-4 py-4 text-right text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {batches.map((batch: any) => (
                  <tr key={batch.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground font-mono">
                      {new Date(batch.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      {batch.documentType || 'IPPIS Broadsheet'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-semibold ${getStatusBadgeClass(batch.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          batch.status === 'COMPLETED' ? 'bg-emerald-500' :
                          batch.status === 'PROCESSING' ? 'bg-blue-500' :
                          batch.status === 'FAILED' ? 'bg-rose-500' : 'bg-amber-500'
                        }`} />
                        {batch.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground font-mono">
                      {batch.period || new Date(batch.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        disabled={downloadingId === batch.id || !(batch.storageKey || batch.fileKey)}
                        onClick={() => handleDownload(batch)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {downloadingId === batch.id ? 'Downloading...' : 'Download File'}
                      </button>
                    </td>
                  </tr>
                ))}
                {batches.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground/70">
                      No document batches found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
