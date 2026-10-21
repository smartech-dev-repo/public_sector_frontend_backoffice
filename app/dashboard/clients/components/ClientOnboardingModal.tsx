"use client";

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useClients } from '@/app/composables/modules/useClients';
import { Modal, ModalContent } from '@/components/layout/modal';
import { 
  X, 
  CheckCircle2, 
  Building2, 
  CreditCard,
  AlertCircle,
  Loader2,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { documents_api } from '@/app/api_factory/modules/documents';

type StepNumber = 1 | 2 | 3 | 4 | 5 | 6;

type DocKey = 'ninSlip' | 'workId' | 'passport' | 'signature';

interface DocSlotState {
  file: File | null;
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  statusText: string;
  errorText?: string;
  isExisting?: boolean;
  url?: string;
}

const docTypeMap: Record<DocKey, string> = {
  ninSlip: 'NIN_CARD',
  workId: 'WORK_ID',
  passport: 'PASSPORT_PHOTO',
  signature: 'SIGNATURE',
};

const docLabels: Record<DocKey, string> = {
  ninSlip: 'NIN slip / card',
  workId: 'Work identity card',
  passport: 'Passport photo in uniform',
  signature: 'Signature',
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function ClientOnboardingModal({ open, onOpenChange, onSuccess }: Props) {
  const { ippisLookup, identityVerification, uploadDocument, runFaceMatch, getClientById, loading } = useClients();
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
  const [docs, setDocs] = useState<Record<DocKey, DocSlotState>>({
    ninSlip: { file: null, status: 'idle', progress: 0, statusText: '' },
    workId: { file: null, status: 'idle', progress: 0, statusText: '' },
    passport: { file: null, status: 'idle', progress: 0, statusText: '' },
    signature: { file: null, status: 'idle', progress: 0, statusText: '' },
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
      ninSlip: { file: null, status: 'idle', progress: 0, statusText: '' },
      workId: { file: null, status: 'idle', progress: 0, statusText: '' },
      passport: { file: null, status: 'idle', progress: 0, statusText: '' },
      signature: { file: null, status: 'idle', progress: 0, statusText: '' },
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

  // Populate pre-existing documents and identity info if found in employeeRecord
  useEffect(() => {
    if (!employeeRecord) return;

    if (employeeRecord.bvn && !bvn) setBvn(employeeRecord.bvn);
    if (employeeRecord.nin && !nin) setNin(employeeRecord.nin);

    const backendDocs = employeeRecord.documents || [];
    if (Array.isArray(backendDocs) && backendDocs.length > 0) {
      setDocs((prev) => {
        const next = { ...prev };
        backendDocs.forEach((d: any) => {
          const type = d.documentType;
          (Object.keys(docTypeMap) as DocKey[]).forEach((key) => {
            if (docTypeMap[key] === type) {
              next[key] = {
                file: null,
                status: 'success',
                progress: 100,
                statusText: 'Verified on file',
                isExisting: true,
                url: d.url,
              };
            }
          });
        });
        return next;
      });
    }
  }, [employeeRecord]);

  // Step 1 -> 2: Lookup IPPIS
  const handleIppisLookup = async () => {
    if (!ippisNumber.trim()) {
      return toast.error('Please enter an IPPIS number');
    }
    try {
      const res: any = await ippisLookup({ ippisNumber: ippisNumber.trim() });
      const foundId = res?.clientId || res?.id;
      if (!foundId) {
        toast.error('Unable to resolve client ID from IPPIS record');
        return;
      }
      setClientId(foundId);

      // Attempt to fetch full client detail to get any existing documents and full state
      let fullRecord = res;
      try {
        const clientDetail = await getClientById(foundId);
        if (clientDetail) {
          fullRecord = {
            ...res,
            ...clientDetail,
            ...(clientDetail.onboarding || {}),
            documents: clientDetail.onboarding?.documents || clientDetail.documents || res.documents || []
          };
        }
      } catch {
        // Fallback to res
      }

      setEmployeeRecord(fullRecord);
      if (fullRecord.bvn) setBvn(fullRecord.bvn);
      if (fullRecord.nin) setNin(fullRecord.nin);

      toast.success('IPPIS payroll record found');
      setStep(2);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to lookup IPPIS record');
    }
  };

  // Step 2 Proceed: Route intelligently based on the client's current onboarding status!
  const handleConfirmRecord = () => {
    const backendStep = employeeRecord?.step;
    if (backendStep === 'COMPLETED' || employeeRecord?.status === 'VERIFIED') {
      setCompleted(true);
    } else if (backendStep === 'DOCUMENTS_SUBMITTED') {
      // Identity & all documents uploaded; proceed to face match
      setStep(6);
    } else if (backendStep === 'IDENTITY_SUBMITTED' || employeeRecord?.identityVerified) {
      // BVN & NIN are already confirmed! Proceed directly to Step 5 (Upload customer documents)
      setStep(5);
    } else {
      // First-time onboarding, proceed to Step 3 (Verify BVN & NIN)
      setStep(3);
    }
  };

  // Step 3 -> 4: Verify BVN & NIN
  const handleIdentity = async () => {
    if (bvn.length !== 11) return toast.error('BVN must be exactly 11 digits');
    if (nin.length !== 11) return toast.error('NIN must be exactly 11 digits');
    if (!clientId) return toast.error('Client ID is missing');

    try {
      const res = await identityVerification(clientId, { bvn, nin });
      setEmployeeRecord((prev: any) => ({
        ...prev,
        ...(res?.data || res),
        bvn,
        nin,
        identityVerified: true,
        step: 'IDENTITY_SUBMITTED',
      }));
      toast.success('Identity verified successfully against NIBSS and NIMC');
      setStep(4);
    } catch (e: any) {
      toast.error(e?.message || 'Identity verification failed');
    }
  };

  // Step 4 -> 5: Review with customer confirmed
  const handleReviewProceed = () => {
    setStep(5);
  };

  // Step 5: Upload an individual document
  const handleFileSelect = async (key: DocKey, file: File) => {
    if (!clientId) {
      toast.error('Client ID is missing');
      return;
    }

    if (key === 'passport' && file.type === 'application/pdf') {
      toast.error('Passport photo must be an image (JPEG or PNG) for facial comparison, not a PDF');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size cannot exceed 5MB');
      return;
    }

    const sizeStr = formatFileSize(file.size);
    setDocs((prev) => ({
      ...prev,
      [key]: {
        file,
        status: 'uploading',
        progress: 60,
        statusText: `${sizeStr} • Uploading...`,
        errorText: '',
        isExisting: false,
      },
    }));

    try {
      const res = await uploadDocument(clientId, docTypeMap[key], file);
      setDocs((prev) => ({
        ...prev,
        [key]: {
          file,
          status: 'success',
          progress: 100,
          statusText: sizeStr,
          isExisting: false,
          url: res?.url || res?.storageKey,
        },
      }));
      toast.success(`${docLabels[key]} uploaded successfully`);
    } catch (err: any) {
      const errorMsg = err?.message || 'Upload failed';
      setDocs((prev) => ({
        ...prev,
        [key]: {
          file,
          status: 'error',
          progress: 0,
          statusText: 'Upload failed',
          errorText: errorMsg,
          isExisting: false,
        },
      }));
      toast.error(`Failed to upload ${docLabels[key]}: ${errorMsg}`);
    }
  };

  const handleRemoveDoc = (key: DocKey) => {
    setDocs((prev) => ({
      ...prev,
      [key]: { file: null, status: 'idle', progress: 0, statusText: '' },
    }));
  };

  // Step 5 -> 6: Validate all 4 documents uploaded before advancing
  const handleDocumentsProceed = () => {
    const isReady = (key: DocKey) => docs[key]?.status === 'success';
    const missing = (Object.keys(docTypeMap) as DocKey[]).filter((k) => !isReady(k));

    if (missing.length > 0) {
      const missingLabels = missing.map((k) => docLabels[k]).join(', ');
      return toast.error(`All 4 documents are required. Missing: ${missingLabels}`);
    }

    setStep(6);
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
      toast.error(e?.message || 'Biometric cross-check failed');
    }
  };

  const isIdentityAlreadyDone = Boolean(
    employeeRecord?.step === 'IDENTITY_SUBMITTED' || 
    employeeRecord?.step === 'DOCUMENTS_SUBMITTED' || 
    employeeRecord?.step === 'COMPLETED' || 
    employeeRecord?.identityVerified
  );

  const [bvnPhotoBlobUrl, setBvnPhotoBlobUrl] = useState<string | null>(null);
  const [bvnPhotoFailed, setBvnPhotoFailed] = useState(false);
  const [passportBlobUrl, setPassportBlobUrl] = useState<string | null>(null);
  const [passportPhotoFailed, setPassportPhotoFailed] = useState(false);

  // Fetch biometric photo blob with auth header
  useEffect(() => {
    let active = true;
    const fetchBiometricPhoto = async () => {
      setBvnPhotoFailed(false);
      const rawUrl = employeeRecord?.bvnSelfieUrl || employeeRecord?.ninSelfieUrl;
      const directKey = employeeRecord?.bvnSelfie || employeeRecord?.ninSelfie;
      const fileKey = directKey || (
        rawUrl && rawUrl.includes('/admin/documents/files/')
          ? decodeURIComponent(rawUrl.split('/admin/documents/files/')[1])
          : null
      );

      if (!fileKey) {
        if (!rawUrl) setBvnPhotoFailed(true);
        return;
      }

      try {
        const res = await documents_api.getDocumentFile(fileKey);
        if (!active) return;
        const blob = res.data;
        if (blob && blob.size > 0 && blob.type !== 'application/json') {
          const url = URL.createObjectURL(blob);
          setBvnPhotoBlobUrl(url);
          setBvnPhotoFailed(false);
        } else {
          setBvnPhotoFailed(true);
        }
      } catch {
        if (active) setBvnPhotoFailed(true);
      }
    };

    fetchBiometricPhoto();

    return () => {
      active = false;
    };
  }, [employeeRecord?.bvnSelfieUrl, employeeRecord?.ninSelfieUrl, employeeRecord?.bvnSelfie, employeeRecord?.ninSelfie]);

  // Fetch or resolve passport photo preview
  useEffect(() => {
    let active = true;
    if (docs.passport?.file && docs.passport.file.type.startsWith('image/')) {
      const url = URL.createObjectURL(docs.passport.file);
      setPassportBlobUrl(url);
      setPassportPhotoFailed(false);
      return;
    }

    const docObj = employeeRecord?.documents?.find((d: any) => d.documentType === 'PASSPORT_PHOTO');
    const rawUrl = docs.passport?.url || docObj?.url;
    const directKey = docObj?.storageKey;
    const fileKey = directKey || (
      rawUrl && rawUrl.includes('/admin/documents/files/')
        ? decodeURIComponent(rawUrl.split('/admin/documents/files/')[1])
        : null
    );

    if (!fileKey) {
      if (rawUrl && (rawUrl.startsWith('http') || rawUrl.startsWith('data:'))) {
        setPassportBlobUrl(rawUrl);
        setPassportPhotoFailed(false);
      } else {
        setPassportPhotoFailed(true);
      }
      return;
    }

    const fetchPassport = async () => {
      try {
        const res = await documents_api.getDocumentFile(fileKey);
        if (!active) return;
        const blob = res.data;
        if (blob && blob.size > 0 && blob.type !== 'application/json') {
          setPassportBlobUrl(URL.createObjectURL(blob));
          setPassportPhotoFailed(false);
        } else {
          setPassportPhotoFailed(true);
        }
      } catch {
        if (active) setPassportPhotoFailed(true);
      }
    };

    fetchPassport();

    return () => {
      active = false;
    };
  }, [docs.passport?.file, docs.passport?.url, employeeRecord?.documents]);

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    } else if (step === 4) {
      setStep(2);
    } else if (step === 5) {
      if (isIdentityAlreadyDone) {
        setStep(2);
      } else {
        setStep(4);
      }
    } else if (step === 6) {
      setStep(5);
    }
  };

  const displayBvn = employeeRecord?.bvn || bvn;
  const displayNin = employeeRecord?.nin || nin;

  const formatDob = (val: any) => {
    if (!val) return '—';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return String(val);
      return d.toLocaleDateString('en-GB');
    } catch {
      return String(val);
    }
  };

  const formatLengthOfService = (val: any) => {
    if (!val) return '—';
    if (typeof val === 'object' && (val.years !== undefined || val.months !== undefined)) {
      const yrs = val.years ?? 0;
      const mos = val.months ?? 0;
      return `${yrs} yr${yrs === 1 ? '' : 's'} ${mos} mo${mos === 1 ? '' : 's'}`;
    }
    return String(val);
  };

  // Document item renderer for Step 5
  const renderDocDropzone = (
    label: string,
    key: DocKey,
    inputRef: React.RefObject<HTMLInputElement | null>,
    isImageOnly: boolean = false
  ) => {
    const doc = docs[key];

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-foreground/85">
            {label}
          </label>
          {doc.status === 'success' && (
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="size-3.5" /> Ready
            </span>
          )}
          {doc.status === 'error' && (
            <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
              <AlertCircle className="size-3.5" /> Upload Failed
            </span>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={isImageOnly ? '.png,.jpg,.jpeg' : '.png,.jpg,.jpeg,.pdf'}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(key, file);
          }}
        />

        {doc.status === 'uploading' ? (
          <div className="rounded-xl border border-border/80 bg-background p-3.5 relative overflow-hidden shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-8 rounded-lg bg-emerald-100 text-[#018752] flex items-center justify-center shrink-0">
                  <Loader2 className="size-4 animate-spin text-[#018752]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-foreground truncate">
                    {doc.file?.name || label}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Uploading to server...
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#018752] shrink-0 animate-pulse">
                Uploading
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
              <div className="h-full bg-[#018752] w-2/3 animate-pulse" />
            </div>
          </div>
        ) : doc.status === 'success' ? (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20 p-3 sm:p-3.5 relative overflow-hidden shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-8 rounded-lg bg-[#018752] text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-[13px] font-bold text-foreground truncate">
                    {doc.file?.name || (doc.isExisting ? `${label} on file` : label)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {doc.statusText || 'Uploaded successfully'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="text-[11px] font-semibold text-[#018752] hover:underline"
                  title="Replace file"
                >
                  Replace
                </button>
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
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#018752]" />
          </div>
        ) : doc.status === 'error' ? (
          <div className="rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/20 dark:bg-rose-950/20 p-3 sm:p-3.5 relative overflow-hidden shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-8 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertCircle className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-rose-700 dark:text-rose-400 truncate">
                    {doc.file?.name || 'Upload failed'}
                  </p>
                  <p className="text-[10px] text-rose-600/90 dark:text-rose-400/90 mt-0.5 truncate">
                    {doc.errorText || 'Server rejected file'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="size-7 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 flex items-center justify-center text-xs font-semibold gap-1 px-2 transition-colors"
                  title="Retry upload"
                >
                  <RefreshCw className="size-3" /> Retry
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveDoc(key)}
                  className="size-6 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                  title="Clear"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleFileSelect(key, file);
            }}
            onClick={() => inputRef.current?.click()}
            className="rounded-xl border border-dashed border-border/90 hover:border-[#018752] bg-background hover:bg-emerald-50/10 p-3.5 sm:p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
          >
            <UploadCloud className="size-5 text-muted-foreground/60 group-hover:text-[#018752] transition-colors mb-1" />
            <p className="text-xs text-muted-foreground">
              Drag and drop or <span className="text-[#018752] font-semibold underline underline-offset-2">choose file</span> to upload
            </p>
            <span className="text-[10px] text-muted-foreground/60 mt-0.5">
              {isImageOnly ? '.png or .jpg (image only)' : '.png, .jpg or .pdf'}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent 
        hideClose 
        className="max-w-[580px] sm:max-w-[620px] w-full p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-card border border-border shadow-2xl outline-none"
      >
        {/* ================= COMPLETED SUCCESS STATE ================= */}
        {completed ? (
          <div className="animate-in fade-in zoom-in-95 duration-200 text-center py-2 relative">
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-0 top-0 size-7 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
              title="Close"
            >
              <X className="size-3.5" />
            </button>

            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF5F0] dark:bg-emerald-950/40 text-[#018752] dark:text-emerald-400 mb-3">
              Step 6 of 6 • Completed
            </div>

            <div className="size-12 rounded-full bg-[#EAF5F0] text-[#018752] flex items-center justify-center mx-auto mb-3 border border-[#018752]/20">
              <CheckCircle2 className="size-6" />
            </div>

            <h2 className="text-xl sm:text-[22px] font-bold text-foreground tracking-tight mb-1.5">
              Onboarding Complete!
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-5">
              The public sector client has been successfully verified, payroll-linked, and activated in Customer Profiles.
            </p>

            <div className="rounded-xl sm:rounded-2xl border border-border/80 p-4 sm:p-5 bg-background mb-6 w-full text-left text-xs sm:text-sm space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Client Name:</span>
                <span className="font-bold text-foreground text-sm sm:text-base">{employeeRecord?.employeeName || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">IPPIS Number:</span>
                <span className="font-mono font-semibold text-foreground">{ippisNumber || employeeRecord?.staffId || employeeRecord?.legacyId || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Status:</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  ACTIVE
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 px-5 rounded-xl bg-[#018752] text-white font-semibold text-sm hover:bg-[#016f43] transition-colors shadow-sm cursor-pointer"
            >
              Done & View Customer
            </button>
          </div>
        ) : (
          <>
            {/* Top Navigation Bar: Back button (when step > 1), Step Badge, and Close Button */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 -ml-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors group cursor-pointer"
                    title="Go back to previous step"
                  >
                    <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
                    <span>Back</span>
                  </button>
                )}
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF5F0] dark:bg-emerald-950/40 text-[#018752] dark:text-emerald-400">
                  Step {step} of 6
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="size-7 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="size-3.5" />
              </button>
            </div>

            {/* ================= STEP 1: START APPLICATION ================= */}
            {step === 1 && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
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
                    className="px-6 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted font-semibold text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleIppisLookup}
                    disabled={loading || !ippisNumber.trim()}
                    className="flex-1 py-2.5 px-5 rounded-xl bg-[#018752] text-white font-semibold text-sm hover:bg-[#016f43] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap shadow-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Looking up...
                      </>
                    ) : (
                      'Look up Customer'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 2: CONFIRM EMPLOYEE DETAILS ================= */}
            {step === 2 && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
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

                {/* Status Indicator Banner */}
                {isIdentityAlreadyDone ? (
                  <div className="bg-[#EAF5F0] dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl p-3 flex items-start gap-3 mb-5">
                    <CheckCircle2 className="size-4 text-[#018752] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-bold text-[#016f43] dark:text-emerald-300">
                        Identity Verified (BVN & NIN Confirmed)
                      </p>
                      <p className="text-[#016f43]/85 dark:text-emerald-300/80 mt-0.5 leading-snug">
                        Customer identity was previously validated against NIBSS and NIMC. Proceed directly to document upload.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#EAF5F0] dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl p-3 flex items-center gap-3 mb-5">
                    <CheckCircle2 className="size-4 text-[#018752] shrink-0" />
                    <p className="text-xs font-medium text-[#016f43] dark:text-emerald-300 leading-snug">
                      Employee record verified directly from the Federal Ministry of Finance IPPIS database.
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  {isIdentityAlreadyDone && (
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="py-2.5 px-4 rounded-xl border border-border text-foreground hover:bg-muted font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Review Details
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleConfirmRecord}
                    className="flex-1 py-2.5 px-5 rounded-xl bg-[#018752] text-white font-semibold text-xs sm:text-sm hover:bg-[#016f43] transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-sm cursor-pointer"
                  >
                    {isIdentityAlreadyDone ? (
                      <>
                        <span className="whitespace-nowrap">Proceed to Document Upload</span>
                        <ArrowRight className="size-4 shrink-0" />
                      </>
                    ) : (
                      <>
                        <span className="whitespace-nowrap">Proceed</span>
                        <ArrowRight className="size-4 shrink-0" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 3: VERIFY CUSTOMER IDENTITY ================= */}
            {step === 3 && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <h2 className="text-xl sm:text-[22px] font-bold text-foreground tracking-tight mb-1.5">
                  Verify customer identity
                </h2>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                  Customer BVN and NIN generate all your personal details date of birth, gender, address, next of kin and more.
                </p>

                {isIdentityAlreadyDone ? (
                  <div className="space-y-4">
                    <div className="bg-[#EAF5F0] dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl p-3 flex items-start gap-3">
                      <CheckCircle2 className="size-4 text-[#018752] shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-bold text-[#016f43] dark:text-emerald-300">
                          Identity Already Verified
                        </p>
                        <p className="text-[#016f43]/85 dark:text-emerald-300/80 mt-0.5">
                          This customer&apos;s BVN and NIN were previously confirmed against NIBSS and NIMC. Re-submission is not required.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-border p-3 bg-background">
                        <span className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          BVN
                        </span>
                        <span className="text-sm font-bold text-foreground font-mono">
                          {displayBvn ? `••••••• ${displayBvn.slice(-4)}` : 'Verified'}
                        </span>
                      </div>
                      <div className="rounded-xl border border-border p-3 bg-background">
                        <span className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          NIN
                        </span>
                        <span className="text-sm font-bold text-foreground font-mono">
                          {displayNin ? `••••• ${displayNin.slice(-4)}` : 'Verified'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(5)}
                        className="w-full py-2.5 px-5 rounded-xl bg-[#018752] text-white font-semibold text-sm hover:bg-[#016f43] transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-sm cursor-pointer"
                      >
                        <span className="whitespace-nowrap">Proceed to Document Upload</span>
                        <ArrowRight className="size-4 shrink-0" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
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
                        Validated against NIBSS (BVN) and NIMC (NIN). Your name from both must match your IPPIS record.
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleIdentity}
                        disabled={loading || bvn.length !== 11 || nin.length !== 11}
                        className="w-full py-2.5 px-5 rounded-xl bg-[#018752] text-white font-semibold text-sm hover:bg-[#016f43] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap shadow-sm cursor-pointer"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="size-4 animate-spin" /> <span className="whitespace-nowrap">Validating with NIBSS & NIMC...</span>
                          </>
                        ) : (
                          <>
                            <span className="whitespace-nowrap">Verify & Proceed</span>
                            <ArrowRight className="size-4 shrink-0" />
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ================= STEP 4: REVIEW WITH THE CUSTOMER ================= */}
            {step === 4 && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <h2 className="text-xl sm:text-[22px] font-bold text-foreground tracking-tight mb-1">
                  Review with the customer
                </h2>

                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                  Auto-filled from IPPIS & Verified Identity (READ ONLY)
                </p>

                <div className="space-y-2 mb-4 max-h-[360px] sm:max-h-[400px] overflow-y-auto pr-1">
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
                        BVN
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-foreground font-mono tracking-wider">
                        {displayBvn ? `••••••• ${displayBvn.slice(-4)}` : '—'}
                      </span>
                    </div>
                    <div className="rounded-xl border border-border/80 p-2.5 bg-background">
                      <span className="block text-[10px] font-medium text-muted-foreground mb-0.5">
                        NIN
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-foreground font-mono tracking-wider">
                        {displayNin ? `••••• ${displayNin.slice(-4)}` : '—'}
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
                        {formatDob(employeeRecord?.identityDateOfBirth || employeeRecord?.dob || employeeRecord?.dateOfBirth)}
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
                        {formatLengthOfService(employeeRecord?.lengthOfService)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleReviewProceed}
                    className="w-full py-2.5 px-5 rounded-xl bg-[#018752] text-white font-semibold text-sm hover:bg-[#016f43] transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-sm cursor-pointer"
                  >
                    <span className="whitespace-nowrap">Proceed to Document Upload</span>
                    <ArrowRight className="size-4 shrink-0" />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 5: UPLOAD CUSTOMER DOCUMENTS ================= */}
            {step === 5 && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <h2 className="text-xl sm:text-[22px] font-bold text-foreground tracking-tight mb-1.5">
                  Upload customer documents
                </h2>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                  All 4 documents must be uploaded to confirm customer profile and proceed to biometric cross-check.
                </p>

                {/* 4 Document Dropzones in Order */}
                <div className="space-y-3.5 mb-5 max-h-[420px] sm:max-h-[460px] overflow-y-auto pr-1.5 scrollbar-thin">
                  {renderDocDropzone('NIN slip / card', 'ninSlip', ninSlipRef)}
                  {renderDocDropzone('Work identity card', 'workId', workIdRef)}
                  {renderDocDropzone('Passport photo in uniform (image only)', 'passport', passportRef, true)}
                  {renderDocDropzone('Signature', 'signature', signatureRef)}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleDocumentsProceed}
                    disabled={loading}
                    className="w-full py-2.5 px-5 rounded-xl bg-[#018752] text-white font-semibold text-sm hover:bg-[#016f43] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap shadow-sm cursor-pointer"
                  >
                    <span className="whitespace-nowrap">Proceed to Facial Cross-check</span>
                    <ArrowRight className="size-4 shrink-0" />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 6: PASSPORT FACIAL CROSS-CHECK ================= */}
            {step === 6 && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <h2 className="text-xl sm:text-[22px] font-bold text-foreground tracking-tight mb-1.5">
                  Passport facial cross-check
                </h2>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                  The customer&apos;s passport photo (in uniform) is matched 1:1 against their BVN/NIN biometric image.
                </p>

                {/* Facial cross-check visual comparison container */}
                <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6 py-4 bg-muted/20 border border-border/60 rounded-2xl p-4">
                  {/* Left: Passport photo card */}
                  <div className="flex flex-col items-center">
                    <div className="size-28 sm:size-32 rounded-2xl bg-card border border-border/80 flex items-center justify-center overflow-hidden shadow-xs relative">
                      {passportBlobUrl && !passportPhotoFailed ? (
                        <img 
                          src={passportBlobUrl} 
                          alt="Passport preview" 
                          className="size-full object-cover"
                          onError={() => setPassportPhotoFailed(true)}
                        />
                      ) : (
                        <div className="size-full flex flex-col items-center justify-center bg-muted/30 p-2 text-center select-none">
                          <div className="size-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center mb-1.5">
                            <User className="size-5" />
                          </div>
                          <span className="text-[11px] font-bold text-foreground">Passport Photo</span>
                          <span className="text-[9px] text-muted-foreground">In Uniform</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-foreground/80 mt-2 font-semibold text-center">
                      Passport (uniform)
                    </span>
                  </div>

                  {/* Middle: Green match badge */}
                  <div className="flex flex-col items-center justify-center select-none px-1">
                    <div className="size-9 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#018752] flex items-center justify-center shadow-xs">
                      <RefreshCw className="size-4" />
                    </div>
                    <span className="text-[10px] font-bold text-[#018752] mt-1 tracking-wider uppercase">1:1 MATCH</span>
                  </div>

                  {/* Right: BVN / NIN Photo card */}
                  <div className="flex flex-col items-center">
                    <div className="size-28 sm:size-32 rounded-2xl bg-card border border-border/80 flex items-center justify-center overflow-hidden shadow-xs relative">
                      {bvnPhotoBlobUrl && !bvnPhotoFailed ? (
                        <img 
                          src={bvnPhotoBlobUrl} 
                          alt="Biometric photo" 
                          className="size-full object-cover" 
                          onError={() => setBvnPhotoFailed(true)}
                        />
                      ) : (
                        <div className="size-full flex flex-col items-center justify-center bg-emerald-50/40 dark:bg-emerald-950/20 p-2 text-center select-none">
                          <div className="size-10 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-[#018752] flex items-center justify-center mb-1.5 shadow-xs">
                            <CheckCircle2 className="size-5" />
                          </div>
                          <span className="text-[11px] font-bold text-foreground">Biometric on File</span>
                          <span className="text-[9px] text-[#018752] font-semibold">NIBSS Verified</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-foreground/80 mt-2 font-semibold text-center">
                      BVN / NIN photo
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleFaceMatch}
                    disabled={loading}
                    className="w-full py-2.5 px-5 rounded-xl bg-[#018752] text-white font-semibold text-sm hover:bg-[#016f43] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap shadow-sm cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> <span className="whitespace-nowrap">Matching biometrics...</span>
                      </>
                    ) : (
                      <>
                        <span className="whitespace-nowrap">Run Biometric Cross-check & Complete</span>
                        <ArrowRight className="size-4 shrink-0" />
                      </>
                    )}
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
