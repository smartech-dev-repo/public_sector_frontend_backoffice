"use client";

import { useEffect, useRef, useState } from 'react';
import { useDocuments } from '@/app/composables/modules/useDocuments';
import { useToast } from '@/app/composables/useToast';
import PulseLoader from '@/app/components/ui/PulseLoader';
import EmptyState from '@/app/components/ui/EmptyState';

export default function UploadsPage() {
  const { loading, batches, fetchDocumentBatches, uploadIppisBroadsheet, uploadDisbursedLoans, uploadRepaymentSchedule } = useDocuments();
  const { addToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);

  const broadsheetInput = useRef<HTMLInputElement>(null);
  const disbursedInput = useRef<HTMLInputElement>(null);
  const repaymentInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocumentBatches().then(() => setIsLoading(false));
  }, [fetchDocumentBatches]);

  const triggerFileSelect = (type: string) => {
    if (type === 'broadsheet') broadsheetInput.current?.click();
    else if (type === 'disbursed') disbursedInput.current?.click();
    else if (type === 'repayment') repaymentInput.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const target = event.target;
    const file = target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      if (type === 'broadsheet') {
        await uploadIppisBroadsheet(formData);
      } else if (type === 'disbursed') {
        await uploadDisbursedLoans(formData);
      } else if (type === 'repayment') {
        await uploadRepaymentSchedule(formData);
      }
      addToast('File uploaded successfully. Processing started.', 'success');
      await fetchDocumentBatches();
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'File upload failed', 'error');
    } finally {
      if (target) target.value = '';
    }
  };

  const statusClass = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'FAILED': return 'bg-rose-100 text-rose-800';
      default: return 'bg-amber-100 text-amber-800';
    }
  };

  return (
    <main className="p-6 space-y-6">
      {isLoading ? (
        <div className="py-20 text-center text-slate-500">
          Loading...
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">Document Uploads</h1>
              <p className="text-sm text-slate-500 mt-1 max-w-xl">Upload monthly employer broadsheets, disbursed loans, or repayment schedules.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Broadsheet Upload */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <div>
                  <h3 className="text-slate-800 font-medium text-sm">IPPIS Broadsheet</h3>
                  <p className="text-xs text-slate-500">.csv, .xlsx</p>
                </div>
              </div>
              <div className="mt-auto border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-emerald-500 transition-colors cursor-pointer" onClick={() => triggerFileSelect('broadsheet')}>
                <div className="text-xs text-slate-600 font-medium">Select File</div>
              </div>
              <input type="file" ref={broadsheetInput} className="hidden" onChange={(e) => handleFileUpload(e, 'broadsheet')} accept=".csv,.xlsx" />
            </div>

            {/* Disbursed Loans Upload */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                  <h3 className="text-slate-800 font-medium text-sm">Disbursed Loans</h3>
                  <p className="text-xs text-slate-500">.csv, .xlsx</p>
                </div>
              </div>
              <div className="mt-auto border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-purple-500 transition-colors cursor-pointer" onClick={() => triggerFileSelect('disbursed')}>
                <div className="text-xs text-slate-600 font-medium">Select File</div>
              </div>
              <input type="file" ref={disbursedInput} className="hidden" onChange={(e) => handleFileUpload(e, 'disbursed')} accept=".csv,.xlsx" />
            </div>

            {/* Repayment Schedule Upload */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <div>
                  <h3 className="text-slate-800 font-medium text-sm">Repayment Schedule</h3>
                  <p className="text-xs text-slate-500">.csv, .xlsx</p>
                </div>
              </div>
              <div className="mt-auto border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-amber-500 transition-colors cursor-pointer" onClick={() => triggerFileSelect('repayment')}>
                <div className="text-xs text-slate-600 font-medium">Select File</div>
              </div>
              <input type="file" ref={repaymentInput} className="hidden" onChange={(e) => handleFileUpload(e, 'repayment')} accept=".csv,.xlsx" />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Upload Batches</h2>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
<table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Rows</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Processed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {batches.map((batch: any) => (
                    <tr key={batch.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-mono">{batch.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{batch.documentType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${statusClass(batch.status)}`}>
                          {batch.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{batch.totalRows || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{batch.processedRows || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{new Date(batch.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {batches.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">No batches found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
</div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
