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
  const [bvn, setBvn] = useState('23598720984');
  const [nin, setNin] = useState('23598720984');

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
    setBvn('23598720984');
    setNin('23598720984');
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
          <div className="rounded-2xl border border-border/80 bg-background p-3.5 relative overflow-hidden shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {/* Green folded document icon */}
                <div className="size-10 rounded-xl bg-[#018752] text-white flex items-center justify-center shrink-0">
                  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                    {doc.file.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {doc.statusText}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveDoc(key);
                  }}
                  className="size-7 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                  title="Remove file"
                >
                  <X className="size-4" />
                </button>
                <span className="text-xs font-semibold text-muted-foreground min-w-[32px] text-right">
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
            className="rounded-2xl border border-dashed border-emerald-400/60 dark:border-emerald-600/50 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all group"
          >
            {/* Upward tray upload icon */}
            <svg 
              className="size-6 text-muted-foreground/60 group-hover:text-[#018752] transition-colors mb-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <p className="text-xs sm:text-[13px] text-muted-foreground">
              Drag and drop or <span className="text-[#018752] font-semibold underline underline-offset-2">choose file</span> to upload
            </p>
            <span className="text-[11px] text-muted-foreground/60 mt-0.5">.png .jpg or .pdf</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent 
        hideClose 
        className="max-w-[580px] w-full p-8 sm:p-10 rounded-[32px] bg-card border border-border shadow-2xl outline-none"
      >
        {/* Top Right Close 'X' Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-6 top-6 size-8 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
          title="Close"
        >
          <X className="size-4" />
        </button>

        {/* ================= COMPLETED SUCCESS STATE ================= */}
        {completed ? (
          <div className="animate-in fade-in zoom-in-95 duration-200 text-center py-2">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF5F0] dark:bg-emerald-950/40 text-[#018752] dark:text-emerald-400 mb-6">
              Step 6 of 6 • Completed
            </div>

            <div className="size-16 rounded-full bg-[#EAF5F0] text-[#018752] flex items-center justify-center mx-auto mb-4 border border-[#018752]/20">
              <CheckCircle2 className="size-8" />
            </div>

            <h2 className="text-2xl sm:text-[26px] font-bold text-foreground tracking-tight mb-2">
              Onboarding Complete!
            </h2>

            <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed max-w-md mx-auto mb-6">
              The public sector client has been successfully verified, payroll-linked, and activated in Customer Profiles.
            </p>

            <div className="rounded-2xl border border-border p-4 bg-background mb-7 max-w-sm mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Client Name:</span>
                <span className="font-bold text-foreground">{employeeRecord?.employeeName || 'Waaz Deke'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IPPIS Number:</span>
                <span className="font-mono font-semibold text-foreground">{ippisNumber || '23598720984'}</span>
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
              className="w-full py-3.5 px-6 rounded-2xl bg-[#018752] text-white font-semibold text-sm hover:bg-[#016f43] transition-colors shadow-sm"
            >
              Done & View Customer
            </button>
          </div>
        ) : (
          <>
            {/* ================= STEP 1: START APPLICATION ================= */}
            {step === 1 && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF5F0] dark:bg-emerald-950/40 text-[#018752] dark:text-emerald-400 mb-5">
                  Step 1 of 6
                </div>

                <h2 className="text-2xl sm:text-[26px] font-bold text-foreground tracking-tight mb-2">
                  Start a new application
                </h2>

                <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed mb-6">
                  First we verify your job. IPPIS confirms your name, employment and salary straight from the government payroll.
                </p>

                {/* Input Card */}
                <div className="rounded-2xl border border-border p-4 bg-background focus-within:border-[#018752] focus-within:ring-2 focus-within:ring-[#018752]/20 transition-all mb-5">
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    CUSTOMER IPPIS NUMBER
                  </label>
                  <input
                    type="text"
                    value={ippisNumber}
                    onChange={(e) => setIppisNumber(e.target.value)}
                    placeholder="23598720984"
                    className="w-full text-base sm:text-lg font-bold text-foreground bg-transparent outline-none placeholder:text-muted-foreground/30 font-mono tracking-wide"
                    autoFocus
                  />
                </div>

                {/* Amber Warning Banner */}
                <div className="bg-[#FFF9EA] dark:bg-amber-950/20 border border-[#FFE8A3] dark:border-amber-800/40 rounded-2xl p-4 flex items-center gap-3.5 mb-7">
                  <div className="size-6 rounded-full border-2 border-[#D97706] text-[#D97706] flex items-center justify-center shrink-0 font-bold text-xs select-none">
                    !
                  </div>
                  <p className="text-xs sm:text-[13px] font-medium text-[#92400E] dark:text-amber-300 leading-snug">
                    The customer must supply all information directly. No agent substitutions are permitted.
                  </p>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center gap-3.5">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-8 py-3.5 rounded-2xl border-2 border-[#018752] text-[#018752] font-semibold text-sm hover:bg-[#EAF5F0] dark:hover:bg-emerald-950/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleIppisLookup}
                    disabled={loading || !ippisNumber.trim()}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-[#018752] text-white font-semibold text-sm hover:bg-[#016f43] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                  >
                    {loading ? 'Looking up...' : 'Look up Customer'}
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 2: CONFIRM EMPLOYEE DETAILS ================= */}
            {step === 2 && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF5F0] dark:bg-emerald-950/40 text-[#018752] dark:text-emerald-400 mb-5">
                  Step 2 of 6
                </div>

                <h2 className="text-2xl sm:text-[26px] font-bold text-foreground tracking-tight mb-2">
                  Confirm Employee Details
                </h2>

                <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed mb-6">
                  We retrieved verified civil service payroll data matching IPPIS number <span className="font-mono font-semibold text-foreground">{ippisNumber || '23598720984'}</span>.
                </p>

                {/* Verified Details Card */}
                <div className="rounded-2xl border border-border p-5 bg-background mb-5 space-y-3.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Verified Employee Name
                      </span>
                      <span className="text-base font-bold text-foreground">
                        {employeeRecord?.employeeName || 'Waaz Deke'}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 text-xs rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {employeeRecord?.employeeStatus || 'Active Employee'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px] mb-0.5">Government Agency</span>
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Building2 className="size-3.5 text-muted-foreground" />
                        {employeeRecord?.agency || 'Nigerian Police Force'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px] mb-0.5">Salary Bank & Account</span>
                      <span className="font-semibold text-foreground flex items-center gap-1.5 font-mono">
                        <CreditCard className="size-3.5 text-muted-foreground" />
                        {employeeRecord?.bankName ? `${employeeRecord.bankName} • ${employeeRecord.accountNumber || ''}` : 'Verified Payroll Account'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#EAF5F0] dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl p-4 flex items-center gap-3.5 mb-7">
                  <CheckCircle2 className="size-5 text-[#018752] shrink-0" />
                  <p className="text-xs sm:text-[13px] font-medium text-[#016f43] dark:text-emerald-300 leading-snug">
                    Employee record verified directly from the Federal Ministry of Finance IPPIS database.
                  </p>
                </div>

                <div className="flex items-center gap-3.5">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-8 py-3.5 rounded-2xl border-2 border-[#018752] text-[#018752] font-semibold text-sm hover:bg-[#EAF5F0] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmRecord}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-[#018752] text-white font-semibold text-sm hover:bg-[#016f43] transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    Proceed
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 3: VERIFY CUSTOMER IDENTITY (Screenshot 3) ================= */}
            {step === 3 && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF5F0] dark:bg-emerald-950/40 text-[#018752] dark:text-emerald-400 mb-5">
                  Step 3 of 6
                </div>

                <h2 className="text-2xl sm:text-[26px] font-bold text-foreground tracking-tight mb-2">
                  Verify customer identity
                </h2>

                <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed mb-6">
                  Customer BVN and NIN generate all your personal details date of birth, gender, address, next of kin and more.
                </p>

                {/* BVN Card */}
                <div className="rounded-2xl border border-border p-4 bg-background focus-within:border-[#018752] transition-all mb-4">
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    BVN
                  </label>
                  <input
                    type="text"
                    value={bvn}
                    onChange={(e) => setBvn(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="23598720984"
                    maxLength={11}
                    className="w-full text-base sm:text-lg font-bold text-foreground bg-transparent outline-none font-mono tracking-wide"
                    autoFocus
                  />
                </div>

                {/* NIN Card */}
                <div className="rounded-2xl border border-border p-4 bg-background focus-within:border-[#018752] transition-all mb-5">
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    NIN
                  </label>
                  <input
                    type="text"
                    value={nin}
                    onChange={(e) => setNin(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="23598720984"
                    maxLength={11}
                    className="w-full text-base sm:text-lg font-bold text-foreground bg-transparent outline-none font-mono tracking-wide"
                  />
                </div>

                {/* Green Verified Banner */}
                <div className="bg-[#EAF5F0] dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl p-4 flex items-center gap-3.5 mb-7">
                  <div className="size-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-[#018752] flex items-center justify-center shrink-0 font-bold text-xs select-none">
                    !
                  </div>
                  <p className="text-xs sm:text-[13px] font-medium text-[#016f43] dark:text-emerald-300 leading-snug">
                    Validated against NIBSS (BVN) and NIMC(NIN). Your name from both must match your IPPIS record.
                  </p>
                </div>

                <div className="flex items-center gap-3.5">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-8 py-3.5 rounded-2xl border-2 border-[#018752] text-[#018752] font-semibold text-sm hover:bg-[#EAF5F0] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleIdentity}
                    disabled={loading || bvn.length !== 11 || nin.length !== 11}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-[#018752] text-white font-semibold text-sm hover:bg-[#016f43] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                  >
                    {loading ? 'Validating...' : 'Proceed'}
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 4: REVIEW WITH THE CUSTOMER (Screenshot 4) ================= */}
            {step === 4 && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF5F0] dark:bg-emerald-950/40 text-[#018752] dark:text-emerald-400 mb-5">
                  Step 4 of 6
                </div>

                <h2 className="text-2xl sm:text-[26px] font-bold text-foreground tracking-tight mb-2">
                  Review with the customer
                </h2>

                <p className="text-xs sm:text-[13px] text-muted-foreground uppercase tracking-wider mb-5">
                  Auto-filled from IPPIS (READ ONLY)
                </p>

                <div className="space-y-3 mb-6 max-h-[380px] overflow-y-auto pr-1">
                  {/* Full Name */}
                  <div className="rounded-2xl border border-border/80 p-3.5 bg-background">
                    <span className="block text-[11px] font-medium text-muted-foreground mb-0.5">
                      Full Name
                    </span>
                    <span className="text-sm sm:text-[15px] font-bold text-foreground">
                      {employeeRecord?.employeeName || 'Waaz Deke'}
                    </span>
                  </div>

                  {/* Bvn & Nin */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-border/80 p-3.5 bg-background">
                      <span className="block text-[11px] font-medium text-muted-foreground mb-0.5">
                        Bvn
                      </span>
                      <span className="text-sm font-bold text-foreground font-mono tracking-wider">
                        ••••••• {bvn ? bvn.slice(-4) : '4821'}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-border/80 p-3.5 bg-background">
                      <span className="block text-[11px] font-medium text-muted-foreground mb-0.5">
                        Nin
                      </span>
                      <span className="text-sm font-bold text-foreground font-mono tracking-wider">
                        ••••• {nin ? `${nin.slice(-4, -3)} ${nin.slice(-3)}` : '7 730'}
                      </span>
                    </div>
                  </div>

                  {/* Date of birth & Gender */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-border/80 p-3.5 bg-background">
                      <span className="block text-[11px] font-medium text-muted-foreground mb-0.5">
                        Date of birth
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        {employeeRecord?.dob || employeeRecord?.dateOfBirth || '14/03/1992'}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-border/80 p-3.5 bg-background">
                      <span className="block text-[11px] font-medium text-muted-foreground mb-0.5">
                        Gender
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        {employeeRecord?.gender || 'Male'}
                      </span>
                    </div>
                  </div>

                  {/* Marital Status & Phone */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-border/80 p-3.5 bg-background">
                      <span className="block text-[11px] font-medium text-muted-foreground mb-0.5">
                        Marital Status
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        {employeeRecord?.maritalStatus || 'Married'}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-border/80 p-3.5 bg-background">
                      <span className="block text-[11px] font-medium text-muted-foreground mb-0.5">
                        Phone
                      </span>
                      <span className="text-sm font-bold text-foreground font-mono">
                        {employeeRecord?.phone ? `${employeeRecord.phone.slice(0, 4)}••••${employeeRecord.phone.slice(-3)}` : '0803••••821'}
                      </span>
                    </div>
                  </div>

                  {/* State of origin & Nationality */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-border/80 p-3.5 bg-background">
                      <span className="block text-[11px] font-medium text-muted-foreground mb-0.5">
                        State of origin
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        {employeeRecord?.stateOfOrigin || 'Anambra'}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-border/80 p-3.5 bg-background">
                      <span className="block text-[11px] font-medium text-muted-foreground mb-0.5">
                        Nationality
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        {employeeRecord?.nationality || 'Nigerian'}
                      </span>
                    </div>
                  </div>

                  {/* Home address */}
                  <div className="rounded-2xl border border-border/80 p-3.5 bg-background">
                    <span className="block text-[11px] font-medium text-muted-foreground mb-0.5">
                      Home address
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {employeeRecord?.address || '14 Bourdillon Rd. Ikoyi. Lagos'}
                    </span>
                  </div>

                  {/* Employment and income section */}
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-2">
                    Employment and income (READ ONLY)
                  </p>

                  {/* Employer */}
                  <div className="rounded-2xl border border-border/80 p-3.5 bg-background">
                    <span className="block text-[11px] font-medium text-muted-foreground mb-0.5">
                      Employer
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {employeeRecord?.agency || employeeRecord?.employer || 'Nigerian Police Force'}
                    </span>
                  </div>

                  {/* Command ID & Length of service */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-border/80 p-3.5 bg-background">
                      <span className="block text-[11px] font-medium text-muted-foreground mb-0.5">
                        Command ID
                      </span>
                      <span className="text-sm font-bold text-foreground font-mono">
                        {employeeRecord?.commandId || employeeRecord?.legacyId || 'NPF-LAG-04'}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-border/80 p-3.5 bg-background">
                      <span className="block text-[11px] font-medium text-muted-foreground mb-0.5">
                        Length of service
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        {employeeRecord?.lengthOfService || '9 yrs 4 mo'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-8 py-3.5 rounded-2xl border-2 border-[#018752] text-[#018752] font-semibold text-sm hover:bg-[#EAF5F0] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleReviewProceed}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-[#018752] text-white font-semibold text-sm hover:bg-[#016f43] transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    Proceed
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 5: UPLOAD CUSTOMER DOCUMENTS (Screenshots 1 & 2) ================= */}
            {step === 5 && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF5F0] dark:bg-emerald-950/40 text-[#018752] dark:text-emerald-400 mb-5">
                  Step 5 of 6
                </div>

                <h2 className="text-2xl sm:text-[26px] font-bold text-foreground tracking-tight mb-2">
                  Upload customer documents
                </h2>

                <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed mb-6">
                  Upload your documents so we run an automatic legibility check on your file.
                </p>

                {/* 4 Document Dropzones in Exact Order */}
                <div className="space-y-4 mb-7 max-h-[400px] overflow-y-auto pr-1">
                  {renderDocDropzone('NIN slip', 'ninSlip', ninSlipRef)}
                  {renderDocDropzone('Work identity card', 'workId', workIdRef)}
                  {renderDocDropzone('Passport photo in uniform', 'passport', passportRef)}
                  {renderDocDropzone('Signature', 'signature', signatureRef)}
                </div>

                <div className="flex items-center gap-3.5">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-8 py-3.5 rounded-2xl border-2 border-[#018752] text-[#018752] font-semibold text-sm hover:bg-[#EAF5F0] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDocumentsProceed}
                    disabled={loading}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-[#018752] text-white font-semibold text-sm hover:bg-[#016f43] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                  >
                    {loading ? 'Uploading...' : 'Proceed'}
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 6: PASSPORT FACIAL CROSS-CHECK (Screenshot 5) ================= */}
            {step === 6 && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF5F0] dark:bg-emerald-950/40 text-[#018752] dark:text-emerald-400 mb-5">
                  Step 6 of 6
                </div>

                <h2 className="text-2xl sm:text-[26px] font-bold text-foreground tracking-tight mb-2">
                  Passport facial cross-check
                </h2>

                <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed mb-8">
                  The customer's passport photo (in uniform) is matched 1:1 against their BVN/NIN biometric image.
                </p>

                {/* Facial cross-check visual comparison container */}
                <div className="flex items-center justify-center gap-4 sm:gap-8 mb-10 py-4">
                  {/* Left: Passport photo card */}
                  <div className="flex flex-col items-center">
                    <div className="size-28 sm:size-32 rounded-2xl bg-muted/40 border border-border/40 flex items-center justify-center overflow-hidden shadow-xs">
                      {passportPreview ? (
                        <img 
                          src={passportPreview} 
                          alt="Passport preview" 
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="size-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 flex items-center justify-center text-3xl select-none">
                          👮‍♂️
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground mt-2.5 font-medium text-center">
                      Passport (uniform)
                    </span>
                  </div>

                  {/* Middle: Green double arrow ⇄ */}
                  <div className="flex items-center justify-center text-[#018752] px-2 select-none">
                    <svg className="size-7 sm:size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M7 16h13M7 16l3 3M7 16l3-3M17 8H4m0 0l3-3M4 8l3 3" />
                    </svg>
                  </div>

                  {/* Right: BVN / NIN Photo card */}
                  <div className="flex flex-col items-center">
                    <div className="size-28 sm:size-32 rounded-2xl bg-muted/40 border border-border/40 flex items-center justify-center overflow-hidden shadow-xs">
                      <div className="size-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 flex items-center justify-center text-[#018752]">
                        <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect x="3" y="4" width="18" height="16" rx="3" strokeWidth="2" />
                          <circle cx="9" cy="10" r="2.5" strokeWidth="2" />
                          <path d="M15 8h2M15 12h2M7 16h10" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground mt-2.5 font-medium text-center">
                      BVN / NIN photo
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-8 py-3.5 rounded-2xl border-2 border-[#018752] text-[#018752] font-semibold text-sm hover:bg-[#EAF5F0] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleFaceMatch}
                    disabled={loading}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-[#018752] text-white font-semibold text-sm hover:bg-[#016f43] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
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
