"use client";

import React, { useState, useRef, useMemo } from 'react';
import { useClients } from '@/app/composables/modules/useClients';
import { Modal, ModalContent } from '@/components/layout/modal';
import { 
  X, 
  CheckCircle2, 
  Building2, 
  CreditCard 
} from 'lucide-react';
import { toast } from 'sonner';

type StepNumber = 1 | 2 | 3 | 4 | 5 | 6;

interface DocUploadState {
  file: File;
  progress: number;
  statusText: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function ClientOnboardingModal({ open, onOpenChange, onSuccess }: Props) {
  const { ippisLookup, identityVerification, uploadDocument, runFaceMatch, loading } = useClients();
  const [step, setStep] = useState<StepNumber>(1);
  const [completed, setCompleted] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [employeeRecord, setEmployeeRecord] = useState<any>(null);

  // Step 1: IPPIS Lookup
  const [ippisNumber, setIppisNumber] = useState('');

  // Step 3: Identity Verification (BVN & NIN)
  const [bvn, setBvn] = useState('');
  const [nin, setNin] = useState('');

  // Step 5: Upload customer documents
  const [docs, setDocs] = useState<{
    ninSlip: DocUploadState | null;
    workId: DocUploadState | null;
    passport: DocUploadState | null;
    signature: DocUploadState | null;
  }>({
    ninSlip: null,
    workId: null,
    passport: null,
    signature: null,
  });

  const ninSlipRef = useRef<HTMLInputElement>(null);
  const workIdRef = useRef<HTMLInputElement>(null);
  const passportRef = useRef<HTMLInputElement>(null);
  const signatureRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setStep(1);
    setCompleted(false);
    setClientId(null);
    setEmployeeRecord(null);
    setIppisNumber('');
    setBvn('');
    setNin('');
    setDocs({
      ninSlip: null,
      workId: null,
      passport: null,
      signature: null,
    });
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    }
    return `${Math.round(bytes / 1024)}KB`;
  };

  const handleFileSelect = (key: 'ninSlip' | 'workId' | 'passport' | 'signature', file: File) => {
    const sizeStr = formatFileSize(file.size);

    // Initial in-progress uploading state (70%)
    setDocs((prev) => ({
      ...prev,
      [key]: {
        file,
        progress: 70,
        statusText: `${sizeStr} • 4 seconds left`,
      },
    }));

    // Transition to 100% complete shortly
    setTimeout(() => {
      setDocs((prev) => {
        if (!prev[key]) return prev;
        return {
          ...prev,
          [key]: {
            file,
            progress: 100,
            statusText: sizeStr,
          },
        };
      });
    }, 700);
  };

  const handleRemoveDoc = (key: 'ninSlip' | 'workId' | 'passport' | 'signature') => {
    setDocs((prev) => ({ ...prev, [key]: null }));
  };

  // Step 1 -> 2: Lookup IPPIS
  const handleIppisLookup = async () => {
    if (!ippisNumber.trim()) {
      return toast.error('Please enter an IPPIS number');
    }
    try {
      const res: any = await ippisLookup({ ippisNumber: ippisNumber.trim() });
      if (res?.type === 'ERROR' || res?.status >= 400 || res?.statusCode >= 400 || res?.error) {
        return;
      }
      const foundId = res?.clientId || res?.id || res?.data?.clientId || res?.data?.id;
      if (!foundId) {
        return;
      }
      setClientId(foundId);
      setEmployeeRecord(res?.data || res);
      toast.success('IPPIS payroll record found');
      setStep(2);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || 'Failed to lookup IPPIS record');
    }
  };

  // Step 2 -> 3: Confirm Record
  const handleConfirmRecord = () => {
    setStep(3);
  };

  // Step 3 -> 4: Verify BVN & NIN
  const handleIdentity = async () => {
    if (bvn.length !== 11) return toast.error('BVN must be exactly 11 digits');
    if (nin.length !== 11) return toast.error('NIN must be exactly 11 digits');
    if (!clientId) return toast.error('Client ID is missing');

    try {
      const res = await identityVerification(clientId, { bvn, nin });
      if (res?.data) {
        setEmployeeRecord((prev: any) => ({ ...prev, ...res.data }));
      }
      toast.success('Identity verified successfully against NIBSS and NIMC');
      setStep(4);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || 'Identity verification failed');
    }
  };

  // Step 4 -> 5: Review with customer confirmed
  const handleReviewProceed = () => {
    setStep(5);
  };

  // Step 5 -> 6: Upload customer documents
  const handleDocumentsProceed = async () => {
    if (!clientId) return toast.error('Client ID is missing');
    const hasAny = docs.ninSlip || docs.workId || docs.passport || docs.signature;
    if (!hasAny) {
      return toast.error('Please select at least one document to proceed');
    }

    try {
      if (docs.ninSlip) await uploadDocument(clientId, 'NIN_CARD', docs.ninSlip.file);
      if (docs.workId) await uploadDocument(clientId, 'WORK_ID', docs.workId.file);
      if (docs.passport) await uploadDocument(clientId, 'PASSPORT_PHOTO', docs.passport.file);
      if (docs.signature) await uploadDocument(clientId, 'SIGNATURE', docs.signature.file);

      toast.success('Documents uploaded successfully');
      setStep(6);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || 'Document upload failed');
    }
  };

  // Step 6: Face Match
  const handleFaceMatch = async () => {
    if (!clientId) return toast.error('Client ID is missing');
    try {
      await runFaceMatch(clientId);
      toast.success('Passport facial cross-check passed 1:1');
      setCompleted(true);
      if (onSuccess) onSuccess();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || 'Face match failed');
    }
  };

  const passportPreview = useMemo(() => {
    if (docs.passport?.file && docs.passport.file.type.startsWith('image/')) {
      return URL.createObjectURL(docs.passport.file);
    }
    return null;
  }, [docs.passport]);

  // Document item renderer for Step 5
  const renderDocDropzone = (
    label: string,
    key: 'ninSlip' | 'workId' | 'passport' | 'signature',
    inputRef: React.RefObject<HTMLInputElement | null>
  ) => {
    const doc = docs[key];

    return (
      <div className="mb-4">
        <label className="block text-xs font-semibold text-foreground/80 mb-1.5">
          {label}
        </label>
        <input
          ref={inputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(key, file);
          }}
        />

        {doc ? (
          // Uploaded or in-progress state (Matches Screenshot 2)
          <div className="rounded-xl border border-border/80 bg-background p-2.5 sm:p-3 relative overflow-hidden shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Green folded document icon */}
                <div className="size-8 rounded-lg bg-[#018752] text-white flex items-center justify-center shrink-0">
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-[13px] font-bold text-foreground truncate">
                    {doc.file.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {doc.statusText}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveDoc(key);
                  }}
                  className="size-6 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                  title="Remove file"
                >
                  <X className="size-3.5" />
                </button>
                <span className="text-xs font-semibold text-muted-foreground min-w-[28px] text-right">
                  {doc.progress}%
                </span>
              </div>
            </div>
            {/* Progress bar line at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
              <div 
                className="h-full bg-[#018752] transition-all duration-300"
                style={{ width: `${doc.progress}%` }}
              />
            </div>
          </div>
        ) : (
          // Empty dashed dropzone state (Matches Screenshot 1)
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleFileSelect(key, file);
            }}
            onClick={() => inputRef.current?.click()}
            className="rounded-xl border border-dashed border-emerald-400/60 dark:border-emerald-600/50 p-3 sm:p-3.5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all group"
          >
            {/* Upward tray upload icon */}
            <svg 
              className="size-5 text-muted-foreground/60 group-hover:text-[#018752] transition-colors mb-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <p className="text-xs text-muted-foreground">
              Drag and drop or <span className="text-[#018752] font-semibold underline underline-offset-2">choose file</span> to upload
            </p>
            <span className="text-[10px] text-muted-foreground/60 mt-0.5">.png .jpg or .pdf</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent 
        hideClose 
        className="max-w-[480px] w-full p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-card border border-border shadow-2xl outline-none"
      >
        {/* Top Right Close 'X' Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 size-7 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
          title="Close"
        >
          <X className="size-3.5" />
        </button>

        {/* ================= COMPLETED SUCCESS STATE ================= */}
        {completed ? (
          <div className="animate-in fade-in zoom-in-95 duration-200 text-center py-1">
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF5F0] dark:bg-emerald-950/40 text-[#018752] dark:text-emerald-400 mb-3">
              Step 6 of 6 • Completed
            </div>

            <div className="size-12 rounded-full bg-[#EAF5F0] text-[#018752] flex items-center justify-center mx-auto mb-3 border border-[#018752]/20">
              <CheckCircle2 className="size-6" />
            </div>

            <h2 className="text-xl sm:text-[22px] font-bold text-foreground tracking-tight mb-1.5">
              Onboarding Complete!
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto mb-4">
              The public sector client has been successfully verified, payroll-linked, and activated in Customer Profiles.
            </p>

            <div className="rounded-xl border border-border p-3 bg-background mb-4 max-w-sm mx-auto text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Client Name:</span>
                <span className="font-bold text-foreground">{employeeRecord?.employeeName || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IPPIS Number:</span>
                <span className="font-mono font-semibold text-foreground">{ippisNumber || employeeRecord?.staffId || employeeRecord?.legacyId || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  ACTIVE
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 px-5 rounded-xl bg-[#018752] text-white font-semibold text-sm hover:bg-[#016f43] transition-colors shadow-sm"
            >
              Done & View Customer
            </button>
          </div>
        ) : (
          <>
            {/* ================= STEP 1: START APPLICATION ================= */}
            {step === 1 && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF5F0] dark:bg-emerald-950/40 text-[#018752] dark:text-emerald-400 mb-3">
                  Step 1 of 6
                </div>

                <h2 className="text-xl sm:text-[22px] font-bold text-foreground tracking-tight mb-1.5">
                  Start a new application
                </h2>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                  First we verify your job. IPPIS confirms your name, employment and salary straight from the government payroll.
                </p>

                {/* Input Card */}
                <div className="rounded-xl border border-border p-3 sm:p-3.5 bg-background focus-within:border-[#018752] focus-within:ring-2 focus-within:ring-[#018752]/20 transition-all mb-3">
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    CUSTOMER IPPIS NUMBER
                  </label>
                  <input
                    type="text"
                    value={ippisNumber}
                    onChange={(e) => setIppisNumber(e.target.value)}
                    placeholder="e.g. PF0122554556"
                    className="w-full text-base font-bold text-foreground bg-transparent outline-none placeholder:text-muted-foreground/30 font-mono tracking-wide"
                    autoFocus
                  />
                </div>

                {/* Amber Warning Banner */}
                <div className="bg-[#FFF9EA] dark:bg-amber-950/20 border border-[#FFE8A3] dark:border-amber-800/40 rounded-xl p-3 flex items-center gap-3 mb-5">
                  <div className="size-5 rounded-full border-2 border-[#D97706] text-[#D97706] flex items-center justify-center shrink-0 font-bold text-[11px] select-none">
                    !
                  </div>
                  <p className="text-xs font-medium text-[#92400E] dark:text-amber-300 leading-snug">
                    The customer must supply all information directly. No agent substitutions are permitted.
                  </p>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-6 py-2.5 rounded-xl border border-[#018752] text-[#018752] font-semibold text-sm hover:bg-[#EAF5F0] dark:hover:bg-emerald-950/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleIppisLookup}
                    disabled={loading || !ippisNumber.trim()}
                    className="flex-1 py-2.5 px-5 rounded-xl bg-[#018752] text-white font-semibold text-sm hover:bg-[#016f43] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                  >
                    {loading ? 'Looking up...' : 'Look up Customer'}
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 2: CONFIRM EMPLOYEE DETAILS ================= */}
            {step === 2 && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF5F0] dark:bg-emerald-950/40 text-[#018752] dark:text-emerald-400 mb-3">
                  Step 2 of 6
                </div>

                <h2 className="text-xl sm:text-[22px] font-bold text-foreground tracking-tight mb-1.5">
                  Confirm Employee Details
                </h2>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                  We retrieved verified civil service payroll data matching IPPIS number <span className="font-mono font-semibold text-foreground">{ippisNumber || employeeRecord?.staffId || employeeRecord?.legacyId || '—'}</span>.
                </p>

                {/* Verified Details Card */}
                <div className="rounded-xl border border-border p-3.5 bg-background mb-3 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Verified Employee Name
                      </span>
                      <span className="text-sm sm:text-base font-bold text-foreground">
                        {employeeRecord?.employeeName || '—'}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 text-[11px] rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {employeeRecord?.employeeStatus || 'Active Employee'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-border/50 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[10px] mb-0.5">Government Agency</span>
                      <span className="font-semibold text-foreground flex items-center gap-1">
                        <Building2 className="size-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{employeeRecord?.agency || '—'}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] mb-0.5">Salary Bank & Account</span>
                      <span className="font-semibold text-foreground flex items-center gap-1 font-mono">
                        <CreditCard className="size-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{employeeRecord?.bankName ? `${employeeRecord.bankName} • ${employeeRecord.accountNumber || ''}` : 'Verified Payroll Account'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#EAF5F0] dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl p-3 flex items-center gap-3 mb-5">
                  <CheckCircle2 className="size-4 text-[#018752] shrink-0" />
                  <p className="text-xs font-medium text-[#016f43] dark:text-emerald-300 leading-snug">
                    Employee record verified directly from the Federal Ministry of Finance IPPIS database.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-6 py-2.5 rounded-xl border border-[#018752] text-[#018752] font-semibold text-sm hover:bg-[#EAF5F0] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmRecord}
                    className="flex-1 py-2.5 px-5 rounded-xl bg-[#018752] text-white font-semibold text-sm hover:bg-[#016f43] transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    Proceed
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 3: VERIFY CUSTOMER IDENTITY ================= */}
            {step === 3 && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF5F0] dark:bg-emerald-950/40 text-[#018752] dark:text-emerald-400 mb-3">
                  Step 3 of 6
                </div>

                <h2 className="text-xl sm:text-[22px] font-bold text-foreground tracking-tight mb-1.5">
                  Verify customer identity
                </h2>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                  Customer BVN and NIN generate all your personal details date of birth, gender, address, next of kin and more.
                </p>

                {/* BVN Card */}
                <div className="rounded-xl border border-border p-3 bg-background focus-within:border-[#018752] transition-all mb-2.5">
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    BVN
                  </label>
                  <input
                    type="text"
                    value={bvn}
                    onChange={(e) => setBvn(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="Enter 11-digit BVN"
                    maxLength={11}
                    className="w-full text-base font-bold text-foreground bg-transparent outline-none font-mono tracking-wide"
                    autoFocus
                  />
                </div>

                {/* NIN Card */}
                <div className="rounded-xl border border-border p-3 bg-background focus-within:border-[#018752] transition-all mb-3">
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    NIN
                  </label>
                  <input
                    type="text"
                    value={nin}
                    onChange={(e) => setNin(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="Enter 11-digit NIN"
                    maxLength={11}
                    className="w-full text-base font-bold text-foreground bg-transparent outline-none font-mono tracking-wide"
                  />
                </div>

                {/* Green Verified Banner */}
                <div className="bg-[#EAF5F0] dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl p-3 flex items-center gap-3 mb-5">
                  <div className="size-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-[#018752] flex items-center justify-center shrink-0 font-bold text-[11px] select-none">
                    !
                  </div>
                  <p className="text-xs font-medium text-[#016f43] dark:text-emerald-300 leading-snug">
                    Validated against NIBSS (BVN) and NIMC(NIN). Your name from both must match your IPPIS record.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-6 py-2.5 rounded-xl border border-[#018752] text-[#018752] font-semibold text-sm hover:bg-[#EAF5F0] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleIdentity}
                    disabled={loading || bvn.length !== 11 || nin.length !== 11}
                    className="flex-1 py-2.5 px-5 rounded-xl bg-[#018752] text-white font-semibold text-sm hover:bg-[#016f43] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                  >
                    {loading ? 'Validating...' : 'Proceed'}
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 4: REVIEW WITH THE CUSTOMER ================= */}
            {step === 4 && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF5F0] dark:bg-emerald-950/40 text-[#018752] dark:text-emerald-400 mb-3">
                  Step 4 of 6
                </div>

                <h2 className="text-xl sm:text-[22px] font-bold text-foreground tracking-tight mb-1">
                  Review with the customer
                </h2>

                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                  Auto-filled from IPPIS (READ ONLY)
                </p>

                <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto pr-1">
                  {/* Full Name */}
                  <div className="rounded-xl border border-border/80 p-2.5 bg-background">
                    <span className="block text-[10px] font-medium text-muted-foreground mb-0.5">
                      Full Name
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {employeeRecord?.employeeName || '—'}
                    </span>
                  </div>

                  {/* Bvn & Nin */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-border/80 p-2.5 bg-background">
                      <span className="block text-[10px] font-medium text-muted-foreground mb-0.5">
                        Bvn
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-foreground font-mono tracking-wider">
                        {bvn ? `••••••• ${bvn.slice(-4)}` : '—'}
                      </span>
                    </div>
                    <div className="rounded-xl border border-border/80 p-2.5 bg-background">
                      <span className="block text-[10px] font-medium text-muted-foreground mb-0.5">
                        Nin
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-foreground font-mono tracking-wider">
                        {nin ? `••••• ${nin.slice(-4)}` : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Date of birth & Gender */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-border/80 p-2.5 bg-background">
                      <span className="block text-[10px] font-medium text-muted-foreground mb-0.5">
                        Date of birth
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-foreground">
                        {employeeRecord?.identityDateOfBirth || employeeRecord?.dob || employeeRecord?.dateOfBirth 
                          ? new Date(employeeRecord.identityDateOfBirth || employeeRecord.dob || employeeRecord.dateOfBirth).toLocaleDateString('en-GB') 
                          : '—'}
                      </span>
                    </div>
                    <div className="rounded-xl border border-border/80 p-2.5 bg-background">
                      <span className="block text-[10px] font-medium text-muted-foreground mb-0.5">
                        Gender
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-foreground">
                        {employeeRecord?.identityGender || employeeRecord?.gender || '—'}
                      </span>
                    </div>
                  </div>

                  {/* Marital Status & Phone */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-border/80 p-2.5 bg-background">
                      <span className="block text-[10px] font-medium text-muted-foreground mb-0.5">
                        Marital Status
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-foreground">
                        {employeeRecord?.maritalStatus || '—'}
                      </span>
                    </div>
                    <div className="rounded-xl border border-border/80 p-2.5 bg-background">
                      <span className="block text-[10px] font-medium text-muted-foreground mb-0.5">
                        Phone
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-foreground font-mono">
                        {employeeRecord?.identityPhoneNumber || employeeRecord?.phone || '—'}
                      </span>
                    </div>
                  </div>

                  {/* State of origin & Nationality */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-border/80 p-2.5 bg-background">
                      <span className="block text-[10px] font-medium text-muted-foreground mb-0.5">
                        State of origin
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-foreground">
                        {employeeRecord?.stateOfOrigin || '—'}
                      </span>
                    </div>
                    <div className="rounded-xl border border-border/80 p-2.5 bg-background">
                      <span className="block text-[10px] font-medium text-muted-foreground mb-0.5">
                        Nationality
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-foreground">
                        {employeeRecord?.nationality || 'Nigerian'}
                      </span>
                    </div>
                  </div>

                  {/* Home address */}
                  <div className="rounded-xl border border-border/80 p-2.5 bg-background">
                    <span className="block text-[10px] font-medium text-muted-foreground mb-0.5">
                      Home address
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-foreground">
                      {employeeRecord?.address ? `${employeeRecord.address}${employeeRecord.city ? `, ${employeeRecord.city}` : ''}` : '—'}
                    </span>
                  </div>

                  {/* Employment and income section */}
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pt-1.5">
                    Employment and income (READ ONLY)
                  </p>

                  {/* Employer */}
                  <div className="rounded-xl border border-border/80 p-2.5 bg-background">
                    <span className="block text-[10px] font-medium text-muted-foreground mb-0.5">
                      Employer
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-foreground">
                      {employeeRecord?.agency || employeeRecord?.employer || '—'}
                    </span>
                  </div>

                  {/* Command ID & Length of service */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-border/80 p-2.5 bg-background">
                      <span className="block text-[10px] font-medium text-muted-foreground mb-0.5">
                        Staff ID / Command ID
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-foreground font-mono">
                        {employeeRecord?.staffId || employeeRecord?.legacyId || employeeRecord?.commandId || ippisNumber || '—'}
                      </span>
                    </div>
                    <div className="rounded-xl border border-border/80 p-2.5 bg-background">
                      <span className="block text-[10px] font-medium text-muted-foreground mb-0.5">
                        Length of service
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-foreground">
                        {employeeRecord?.lengthOfService 
                          ? (typeof employeeRecord.lengthOfService === 'object' ? `${employeeRecord.lengthOfService.years} yrs ${employeeRecord.lengthOfService.months} mo` : employeeRecord.lengthOfService) 
                          : (employeeRecord?.hireDate ? `${new Date().getFullYear() - new Date(employeeRecord.hireDate).getFullYear()} yrs` : '—')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-6 py-2.5 rounded-xl border border-[#018752] text-[#018752] font-semibold text-sm hover:bg-[#EAF5F0] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleReviewProceed}
                    className="flex-1 py-2.5 px-5 rounded-xl bg-[#018752] text-white font-semibold text-sm hover:bg-[#016f43] transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    Proceed
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 5: UPLOAD CUSTOMER DOCUMENTS ================= */}
            {step === 5 && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF5F0] dark:bg-emerald-950/40 text-[#018752] dark:text-emerald-400 mb-3">
                  Step 5 of 6
                </div>

                <h2 className="text-xl sm:text-[22px] font-bold text-foreground tracking-tight mb-1.5">
                  Upload customer documents
                </h2>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                  Upload your documents so we run an automatic legibility check on your file.
                </p>

                {/* 4 Document Dropzones in Exact Order */}
                <div className="space-y-2.5 mb-5 max-h-[320px] overflow-y-auto pr-1">
                  {renderDocDropzone('NIN slip', 'ninSlip', ninSlipRef)}
                  {renderDocDropzone('Work identity card', 'workId', workIdRef)}
                  {renderDocDropzone('Passport photo in uniform', 'passport', passportRef)}
                  {renderDocDropzone('Signature', 'signature', signatureRef)}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-6 py-2.5 rounded-xl border border-[#018752] text-[#018752] font-semibold text-sm hover:bg-[#EAF5F0] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDocumentsProceed}
                    disabled={loading}
                    className="flex-1 py-2.5 px-5 rounded-xl bg-[#018752] text-white font-semibold text-sm hover:bg-[#016f43] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                  >
                    {loading ? 'Uploading...' : 'Proceed'}
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 6: PASSPORT FACIAL CROSS-CHECK ================= */}
            {step === 6 && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF5F0] dark:bg-emerald-950/40 text-[#018752] dark:text-emerald-400 mb-3">
                  Step 6 of 6
                </div>

                <h2 className="text-xl sm:text-[22px] font-bold text-foreground tracking-tight mb-1.5">
                  Passport facial cross-check
                </h2>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                  The customer's passport photo (in uniform) is matched 1:1 against their BVN/NIN biometric image.
                </p>

                {/* Facial cross-check visual comparison container */}
                <div className="flex items-center justify-center gap-4 sm:gap-6 mb-5 py-2">
                  {/* Left: Passport photo card */}
                  <div className="flex flex-col items-center">
                    <div className="size-24 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-center overflow-hidden shadow-xs">
                      {passportPreview ? (
                        <img 
                          src={passportPreview} 
                          alt="Passport preview" 
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="size-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 flex items-center justify-center text-2xl select-none">
                          👮‍♂️
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground mt-2 font-medium text-center">
                      Passport (uniform)
                    </span>
                  </div>

                  {/* Middle: Green double arrow ⇄ */}
                  <div className="flex items-center justify-center text-[#018752] px-2 select-none">
                    <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M7 16h13M7 16l3 3M7 16l3-3M17 8H4m0 0l3-3M4 8l3 3" />
                    </svg>
                  </div>

                  {/* Right: BVN / NIN Photo card */}
                  <div className="flex flex-col items-center">
                    <div className="size-24 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-center overflow-hidden shadow-xs">
                      <div className="size-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 flex items-center justify-center text-[#018752]">
                        <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect x="3" y="4" width="18" height="16" rx="2.5" strokeWidth="2" />
                          <circle cx="9" cy="10" r="2.5" strokeWidth="2" />
                          <path d="M15 8h2M15 12h2M7 16h10" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-[11px] text-muted-foreground mt-2 font-medium text-center">
                      BVN / NIN photo
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-6 py-2.5 rounded-xl border border-[#018752] text-[#018752] font-semibold text-sm hover:bg-[#EAF5F0] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleFaceMatch}
                    disabled={loading}
                    className="flex-1 py-2.5 px-5 rounded-xl bg-[#018752] text-white font-semibold text-sm hover:bg-[#016f43] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                  >
                    {loading ? 'Matching biometrics...' : 'Proceed'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
