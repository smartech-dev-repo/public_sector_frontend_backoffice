"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Check, CheckCircle2, Download, FileSpreadsheet, Loader2, UploadCloud, X, XCircle } from 'lucide-react';
import { documents_api, type DocumentSlug } from '@/app/api_factory/modules/documents';
import { useToast } from '@/app/composables/useToast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/Select';

const STEPS = ['Template', 'Upload', 'Review', 'Confirmation'];
const POLL_INTERVAL_MS = 1500;
const MAX_POLL_FAILURES = 5;
const MAX_POLL_MS = 15 * 60 * 1000;
const VISIBLE_ISSUES = 50;

const SLUG_BY_TYPE: Record<string, DocumentSlug> = {
  IPPIS_BROADSHEET: 'ippis-broadsheet',
  REPAYMENT_SCHEDULE: 'repayment-schedule',
  DISBURSED_LOANS: 'disbursed-loans',
};

const VERDICT_STYLES: Record<string, { label: string; className: string }> = {
  READY: { label: 'Ready to merge', className: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300' },
  MERGE_WITH_CORRECTIONS: { label: 'Can merge, corrections advised', className: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300' },
  REUPLOAD_REQUIRED: { label: 'Re-upload required', className: 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300' },
};

const SEVERITY_LABELS: Record<string, string> = { CLEAN: 'None', MINOR: 'Minor', MODERATE: 'Moderate', SEVERE: 'Severe' };

const ISSUE_STYLES: Record<string, string> = {
  CRITICAL: 'bg-rose-100 text-rose-800',
  ERROR: 'bg-orange-100 text-orange-800',
  WARNING: 'bg-amber-100 text-amber-800',
};

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function currentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function errorMessage(res: any, fallback: string): string {
  const message = res?.data?.message;
  return (Array.isArray(message) ? message.join(', ') : message) || fallback;
}

export interface UploadWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChanged: () => void;
  documentType: string;
  // A batch waiting for review, to reopen the wizard at the review step.
  resumeBatchId?: string | null;
}

export default function UploadWizardModal({ isOpen, onClose, onChanged, documentType, resumeBatchId }: UploadWizardModalProps) {
  const slug = SLUG_BY_TYPE[documentType];
  const { addToast } = useToast();

  const [step, setStep] = useState(0);
  const [template, setTemplate] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [period, setPeriod] = useState(currentPeriod());
  const [agency, setAgency] = useState('');
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'analyzing' | 'merging'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [batch, setBatch] = useState<any>(null);
  const [showAllIssues, setShowAllIssues] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Held in a ref: the page passes a new function each render, and the opening effect
  // below must not re-run because of it, or it resets the wizard and reloads forever.
  const onChangedRef = useRef(onChanged);
  onChangedRef.current = onChanged;

  const stopPolling = useCallback(() => {
    if (pollRef.current) clearTimeout(pollRef.current);
    pollRef.current = null;
  }, []);

  const poll = useCallback((id: string, isDone: (status: string) => boolean, onDone: (batch: any) => void) => {
    const startedAt = Date.now();
    let failures = 0;

    const giveUp = (message: string) => {
      setPhase('idle');
      setError(message);
    };

    const check = () => {
      pollRef.current = setTimeout(async () => {
        const res: any = await documents_api.getDocumentBatchById(id);
        if (res?.type === 'ERROR') {
          // One failure is usually a network blip; the batch is still running server-side.
          failures += 1;
          if (failures >= MAX_POLL_FAILURES) {
            giveUp('We could not check on this upload. It may still finish, so look for it in the upload history.');
            onChangedRef.current();
            return;
          }
          check();
          return;
        }
        failures = 0;
        if (isDone(res.data?.status)) {
          onDone(res.data);
          return;
        }
        if (Date.now() - startedAt > MAX_POLL_MS) {
          giveUp('This is taking longer than expected. It will keep running, so look for it in the upload history.');
          onChangedRef.current();
          return;
        }
        check();
      }, POLL_INTERVAL_MS);
    };

    check();
  }, []);

  const showReview = useCallback((reviewed: any) => {
    setBatch(reviewed);
    setPhase('idle');
    if (reviewed.status === 'FAILED') {
      setStep(1);
      setError(reviewed.errorMessage || 'This file could not be analysed. Please try again.');
    } else {
      setStep(2);
    }
    onChangedRef.current();
  }, []);

  const reset = useCallback(() => {
    stopPolling();
    setStep(0);
    setFile(null);
    setFileError(null);
    setPeriod(currentPeriod());
    setAgency('');
    setProgress(0);
    setPhase('idle');
    setError(null);
    setBatch(null);
    setShowAllIssues(false);
  }, [stopPolling]);

  useEffect(() => {
    if (!isOpen) return;
    reset();
    documents_api.getTemplate(slug).then((res: any) => {
      if (res?.type !== 'ERROR') setTemplate(res.data);
    });
    if (resumeBatchId) {
      documents_api.getDocumentBatchById(resumeBatchId).then((res: any) => {
        if (res?.type !== 'ERROR') showReview(res.data);
      });
    }
    return stopPolling;
  }, [isOpen, slug, resumeBatchId, reset, showReview, stopPolling]);

  const chooseFile = (candidate: File | undefined) => {
    if (!candidate) return;
    setError(null);
    setProgress(0);
    setFile(candidate);
    if (!template?.acceptedFormats.some((format: string) => candidate.name.toLowerCase().endsWith(format))) {
      setFileError('This format is not accepted. Save the file as .xlsx or .csv and try again.');
    } else if (candidate.size === 0) {
      setFileError('This file is empty.');
    } else if (template && candidate.size > template.maxFileSizeBytes) {
      setFileError(`This file is ${formatBytes(candidate.size)}. The limit is ${formatBytes(template.maxFileSizeBytes)}.`);
    } else {
      setFileError(null);
    }
  };

  const handleDownloadTemplate = async () => {
    const res: any = await documents_api.downloadTemplate(slug);
    if (res?.type === 'ERROR') return;
    const url = window.URL.createObjectURL(res.data);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = template?.fileName || `${slug}-template.xlsx`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    if (!file || fileError) return;
    setError(null);
    setPhase('uploading');
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    if (template?.requiresPeriod) formData.append('period', period);
    if (needsAgency) formData.append('agency', agency);

    const res: any = await documents_api.validateUpload(slug, formData, setProgress);
    if (res?.type === 'ERROR') {
      setPhase('idle');
      setError(errorMessage(res, 'The upload failed. Check your connection and try again.'));
      return;
    }

    setBatch(res.data);
    setPhase('analyzing');
    poll(res.data.id, (status) => status !== 'ANALYZING', showReview);
  };

  const handleMerge = async () => {
    setError(null);
    setPhase('merging');
    const res: any = await documents_api.confirmUpload(slug, batch.id);
    if (res?.type === 'ERROR') {
      setPhase('idle');
      setError(errorMessage(res, 'The merge could not be started. Please try again.'));
      return;
    }
    poll(batch.id, (status) => status === 'COMPLETED' || status === 'FAILED', (merged) => {
      setBatch(merged);
      setPhase('idle');
      setStep(3);
      onChanged();
    });
  };

  const handleReupload = async () => {
    const res: any = await documents_api.cancelUpload(slug, batch.id);
    if (res?.type === 'ERROR') {
      addToast(errorMessage(res, 'This upload could not be discarded'), 'error');
      return;
    }
    onChanged();
    setBatch(null);
    setFile(null);
    setProgress(0);
    setShowAllIssues(false);
    setStep(1);
  };

  if (!isOpen || typeof document === 'undefined') return null;

  const analysis = batch?.analysis;
  const issues: any[] = analysis?.issues ?? [];
  const visibleIssues = showAllIssues ? issues : issues.slice(0, VISIBLE_ISSUES);
  const busy = phase !== 'idle';
  const needsAgency = Boolean(file?.name.toLowerCase().endsWith('.csv') && template?.csvAgencies.length);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm" onClick={busy ? undefined : onClose} />

      <div role="dialog" aria-modal="true" aria-label={`Upload ${template?.title ?? 'document'}`} className="relative bg-card rounded-2xl border border-border w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between p-5 sm:p-6 pb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">Upload {template?.title ?? 'document'}</h3>
            {template?.summary && <p className="text-xs text-muted-foreground mt-1">{template.summary}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <ol className="grid grid-cols-4 gap-2 px-5 sm:px-6">
          {STEPS.map((label, index) => (
            <li key={label} aria-current={index === step ? 'step' : undefined} className={`pb-2 border-b-2 text-xs font-semibold flex items-center gap-1.5 ${index === step ? 'border-[#018752] text-[#018752]' : index < step ? 'border-[#018752]/40 text-foreground' : 'border-border text-muted-foreground'}`}>
              <span className={`size-5 shrink-0 rounded-full flex items-center justify-center text-[10px] ${index < step ? 'bg-[#018752] text-white' : 'bg-muted'}`}>
                {index < step ? <Check className="w-3 h-3" /> : index + 1}
              </span>
              <span className="truncate">{label}</span>
            </li>
          ))}
        </ol>

        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div role="alert" className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-700 dark:text-rose-400 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /><span>{error}</span>
            </div>
          )}

          {step === 0 && (
            !template ? (
              <div className="py-10 text-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin inline" /></div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-muted/40 border border-border">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-6 h-6 text-[#018752] shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{template.fileName}</p>
                      <p className="text-xs text-muted-foreground">{template.acceptedFormats.join(', ')} up to {formatBytes(template.maxFileSizeBytes)}</p>
                    </div>
                  </div>
                  <button onClick={handleDownloadTemplate} className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#018752] hover:bg-[#016f43] text-white text-sm font-semibold transition-colors">
                    <Download className="w-4 h-4" /> Download Template
                  </button>
                </div>

                <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
                  {template.notes.map((note: string) => <li key={note}>{note}</li>)}
                </ul>

                {template.sheets.map((sheet: any) => (
                  <div key={sheet.names.join()}>
                    <h4 className="text-xs font-semibold text-foreground mb-2">Sheet: {sheet.names.join(', ')}</h4>
                    <div className="overflow-x-auto border border-border rounded-xl">
                      <table className="min-w-full divide-y divide-border text-xs">
                        <thead className="bg-muted/40">
                          <tr>
                            {['Column', 'Required', 'Format', 'What it means'].map((heading) => (
                              <th key={heading} className="px-3 py-2 text-left font-semibold text-muted-foreground">{heading}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {sheet.columns.map((column: any) => (
                            <tr key={column.header}>
                              <td className="px-3 py-2 font-medium text-foreground whitespace-nowrap">{column.header}</td>
                              <td className="px-3 py-2 whitespace-nowrap">{column.required ? <span className="text-rose-600 font-medium">Required</span> : <span className="text-muted-foreground">Optional</span>}</td>
                              <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{column.format}</td>
                              <td className="px-3 py-2 text-muted-foreground min-w-[220px]">{column.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </>
            )
          )}

          {step === 1 && (
            <>
              {template?.requiresPeriod && (
                <div className="max-w-xs">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Repayment month</label>
                  <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} disabled={busy} className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-[#018752]/20 focus:border-[#018752]" />
                </div>
              )}

              {needsAgency && (
                <div className="max-w-xs">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Agency in this CSV</label>
                  <Select value={agency} onValueChange={setAgency}>
                    <SelectTrigger className="w-full h-11 bg-muted/30 border-border rounded-xl text-sm font-medium"><SelectValue placeholder="Select agency" /></SelectTrigger>
                    <SelectContent hideSearch>
                      {template.csvAgencies.map((name: string) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <button
                type="button"
                disabled={busy}
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (!busy) chooseFile(e.dataTransfer.files?.[0]); }}
                className={`w-full border border-dashed rounded-xl p-8 flex flex-col items-center text-center transition-colors disabled:cursor-not-allowed ${isDragging ? 'border-[#018752] bg-emerald-50/60 dark:bg-emerald-950/20' : 'border-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/10 hover:bg-emerald-50/50'}`}
              >
                <UploadCloud className="w-6 h-6 text-muted-foreground mb-3" />
                <span className="text-sm text-muted-foreground">Drag and drop or <span className="text-emerald-600 font-medium">choose file</span> to upload</span>
                <span className="text-xs text-muted-foreground mt-1">.xlsx or .csv, up to {template ? formatBytes(template.maxFileSizeBytes) : '50 MB'}</span>
              </button>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.csv"
                className="hidden"
                onChange={(e) => { chooseFile(e.target.files?.[0]); e.target.value = ''; }}
              />

              {file && (
                <div className="p-3 rounded-xl border border-border space-y-2">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatBytes(file.size)} · {file.name.split('.').pop()?.toUpperCase()}</p>
                    </div>
                    {fileError
                      ? <span className="flex items-center gap-1 text-xs font-medium text-rose-600 shrink-0"><XCircle className="w-4 h-4" /> Not accepted</span>
                      : <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 shrink-0"><CheckCircle2 className="w-4 h-4" /> Accepted</span>}
                  </div>
                  {fileError && <p className="text-xs text-rose-600">{fileError}</p>}
                  {busy && (
                    <div>
                      <div role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-[#018752] transition-all" style={{ width: `${phase === 'analyzing' ? 100 : progress}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {phase === 'uploading' ? `Uploading ${progress}%` : 'Checking every row. Large files can take a few minutes.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {step === 2 && !analysis && (
            <p className="text-sm text-muted-foreground">This upload has no review results.</p>
          )}

          {step === 2 && analysis && (
            <>
              <div className={`p-4 rounded-xl border ${VERDICT_STYLES[analysis.verdict].className}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold">{VERDICT_STYLES[analysis.verdict].label}</p>
                  <p className="text-xs font-medium">Severity: {SEVERITY_LABELS[analysis.severity]}</p>
                </div>
                <p className="text-xs mt-1 leading-relaxed">{analysis.recommendation}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  ['Total rows', analysis.totalRows],
                  ['New records', analysis.rowsToCreate],
                  ['Updates', analysis.rowsToUpdate],
                  ['Skipped', analysis.rowsToSkip],
                  ['With warnings', analysis.rowsWithWarnings],
                ].map(([label, value]) => (
                  <div key={label as string} className="p-3 rounded-xl bg-muted/40 border border-border">
                    <p className="text-lg font-bold text-foreground">{Number(value).toLocaleString()}</p>
                    <p className="text-[11px] text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>

              {analysis.sheets.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {analysis.sheets.map((sheet: any) => (sheet.recognized ? `${sheet.name}: ${sheet.validRows} of ${sheet.rows} rows valid` : `${sheet.name}: ignored`)).join(' · ')}
                </p>
              )}

              {analysis.issueGroups.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-foreground mb-2">What to check in your file</h4>
                  <ul className="space-y-1.5">
                    {analysis.issueGroups.map((group: any) => (
                      <li key={group.title} className="flex items-start gap-2 text-xs text-foreground">
                        <span className={`px-2 py-0.5 rounded-full font-medium shrink-0 ${ISSUE_STYLES[group.severity]}`}>{group.count.toLocaleString()}</span>
                        <span>
                          {group.title}
                          {group.locations?.length > 0 && (
                            <span className="block text-muted-foreground">
                              {group.locations.join(', ')}{group.count > group.locations.length ? ` and ${(group.count - group.locations.length).toLocaleString()} more` : ''}
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {issues.length > 0 && (
                <details className="rounded-xl border border-border">
                  <summary className="px-3 py-2 text-xs font-semibold text-foreground cursor-pointer">Row by row</summary>
                  <div className="overflow-x-auto max-h-64 overflow-y-auto">
                    <table className="min-w-full divide-y divide-border text-xs">
                      <tbody className="divide-y divide-border">
                        {visibleIssues.map((issue: any, index: number) => (
                          <tr key={index}>
                            <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{issue.sheet ?? 'File'}{issue.row ? `, row ${issue.row}` : ''}</td>
                            <td className="px-3 py-2 text-foreground min-w-[240px]">{issue.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {(issues.length > VISIBLE_ISSUES && !showAllIssues) && (
                    <button onClick={() => setShowAllIssues(true)} className="w-full px-3 py-2 text-xs font-medium text-[#018752] border-t border-border">Show all {issues.length}</button>
                  )}
                  {analysis.issuesTruncated && <p className="px-3 py-2 text-xs text-muted-foreground border-t border-border">Showing the first {issues.length} issues.</p>}
                </details>
              )}
            </>
          )}

          {step === 3 && batch && (
            batch.status === 'COMPLETED' ? (
              <div className="text-center py-4 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#018752] mx-auto" />
                <div>
                  <p className="text-base font-bold text-foreground">File uploaded and merged</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {template?.title ?? 'The file'} has been merged into the {documentType === 'IPPIS_BROADSHEET' ? 'IPPIS record' : 'loan records'}.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
                  {[['Added', batch.rowsCreated], ['Updated', batch.rowsUpdated], ['Skipped', batch.rowsSkipped]].map(([label, value]) => (
                    <div key={label as string} className="p-3 rounded-xl bg-muted/40 border border-border">
                      <p className="text-lg font-bold text-foreground">{Number(value).toLocaleString()}</p>
                      <p className="text-[11px] text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
                {batch.storedFileName && <p className="text-xs text-muted-foreground break-all">Saved as {batch.storedFileName}</p>}
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <XCircle className="w-12 h-12 text-rose-600 mx-auto" />
                <p className="text-base font-bold text-foreground">The merge did not finish</p>
                <p className="text-xs text-muted-foreground">{batch.errorMessage || 'Something went wrong while merging this file.'}</p>
              </div>
            )
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 p-5 sm:p-6 pt-4 border-t border-border">
          {step === 0 && (
            <button onClick={() => setStep(1)} disabled={!template} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#018752] hover:bg-[#016f43] transition-colors disabled:opacity-50">Next</button>
          )}
          {step === 1 && (
            <>
              <button onClick={() => setStep(0)} disabled={busy} className="px-5 py-2.5 rounded-xl text-sm font-medium text-foreground bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50">Back</button>
              <button onClick={handleUpload} disabled={!file || Boolean(fileError) || busy || (needsAgency && !agency)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#018752] hover:bg-[#016f43] transition-colors disabled:opacity-50 flex items-center gap-2">
                {busy && <Loader2 className="w-4 h-4 animate-spin" />} Upload and Check
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <button onClick={handleReupload} disabled={busy} className="px-5 py-2.5 rounded-xl text-sm font-medium text-foreground bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50">Upload a Corrected File</button>
              {analysis?.canMerge && (
                <button onClick={handleMerge} disabled={busy} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#018752] hover:bg-[#016f43] transition-colors disabled:opacity-50 flex items-center gap-2">
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  {busy ? 'Merging...' : `Merge ${analysis.validRows.toLocaleString()} Rows`}
                </button>
              )}
            </>
          )}
          {step === 3 && (
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#018752] hover:bg-[#016f43] transition-colors">Done</button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
