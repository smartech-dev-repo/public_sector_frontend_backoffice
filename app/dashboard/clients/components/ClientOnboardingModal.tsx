import React, { useState } from 'react';
import { useClients } from '@/app/composables/modules/useClients';
import { Modal, ModalContent } from '@/components/layout/modal';
import { X, CheckCircle2, ChevronRight, UploadCloud, Search } from 'lucide-react';
import { toast } from 'sonner';

type Step = 'ippis' | 'identity' | 'documents' | 'facematch' | 'success';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ClientOnboardingModal({ open, onOpenChange }: Props) {
  const { ippisLookup, identityVerification, uploadDocument, runFaceMatch, loading } = useClients();
  const [step, setStep] = useState<Step>('ippis');
  const [clientId, setClientId] = useState<string | null>(null);

  // Form State
  const [ippisNumber, setIppisNumber] = useState('');
  const [bvn, setBvn] = useState('');
  const [nin, setNin] = useState('');
  
  // Document State
  const [passport, setPassport] = useState<File | null>(null);
  const [workId, setWorkId] = useState<File | null>(null);
  const [signature, setSignature] = useState<File | null>(null);
  const [bvnSelfie, setBvnSelfie] = useState<File | null>(null);
  const [ninSelfie, setNinSelfie] = useState<File | null>(null);
  const [liveSelfie, setLiveSelfie] = useState<File | null>(null);

  const resetState = () => {
    setStep('ippis');
    setClientId(null);
    setIppisNumber('');
    setBvn('');
    setNin('');
    setPassport(null);
    setWorkId(null);
    setSignature(null);
    setBvnSelfie(null);
    setNinSelfie(null);
    setLiveSelfie(null);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleIppisLookup = async () => {
    if (!ippisNumber) return toast.error('Please enter an IPPIS number');
    try {
      const res = await ippisLookup({ ippisNumber });
      const foundId = res?.clientId || res?.id || res?.data?.clientId || res?.data?.id;
      if (!foundId) {
        toast.error('Could not find client ID in response');
        return;
      }
      setClientId(foundId);
      toast.success('IPPIS lookup successful');
      setStep('identity');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || 'Failed to lookup IPPIS record');
    }
  };

  const handleIdentity = async () => {
    if (!bvn || !nin) return toast.error('Please enter BVN and NIN');
    if (!clientId) return toast.error('Client ID is missing');
    try {
      await identityVerification(clientId, { bvn, nin });
      toast.success('Identity verified');
      setStep('documents');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || 'Identity verification failed');
    }
  };

  const handleDocuments = async () => {
    if (!clientId) return toast.error('Client ID is missing');
    
    try {
      if (passport) await uploadDocument(clientId, 'PASSPORT_PHOTO', passport);
      if (workId) await uploadDocument(clientId, 'WORK_ID', workId);
      if (signature) await uploadDocument(clientId, 'SIGNATURE', signature);
      if (bvnSelfie) await uploadDocument(clientId, 'BVN_SELFIE', bvnSelfie);
      if (ninSelfie) await uploadDocument(clientId, 'NIN_SELFIE', ninSelfie);
      if (liveSelfie) await uploadDocument(clientId, 'LIVE_SELFIE', liveSelfie);
      
      toast.success('Documents uploaded successfully');
      setStep('facematch');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || 'Document upload failed');
    }
  };

  const handleFaceMatch = async () => {
    if (!clientId) return toast.error('Client ID is missing');
    try {
      await runFaceMatch(clientId);
      toast.success('Face match completed successfully');
      setStep('success');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || 'Face match failed');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'ippis':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold">Public Sector Onboarding</h3>
              <p className="text-sm text-muted-foreground mt-1">Enter the IPPIS number to fetch the civil servant record.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">IPPIS Number</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input 
                  type="text" 
                  value={ippisNumber}
                  onChange={(e) => setIppisNumber(e.target.value)}
                  placeholder="e.g. NPF/10234"
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button 
                onClick={handleIppisLookup} 
                disabled={loading || !ippisNumber}
                className="px-6 py-2.5 bg-[#0F7642] text-white rounded-xl font-medium hover:bg-[#0F7642]/90 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Continue'} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      case 'identity':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold">Identity Details</h3>
              <p className="text-sm text-muted-foreground mt-1">Enter the BVN and NIN for the client.</p>
            </div>
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">BVN</label>
                <input 
                  type="text" 
                  value={bvn}
                  onChange={(e) => setBvn(e.target.value)}
                  placeholder="11-digit BVN"
                  maxLength={11}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">NIN</label>
                <input 
                  type="text" 
                  value={nin}
                  onChange={(e) => setNin(e.target.value)}
                  placeholder="11-digit NIN"
                  maxLength={11}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                />
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <button onClick={() => setStep('ippis')} className="px-6 py-2.5 bg-muted text-muted-foreground rounded-xl font-medium hover:bg-muted/80">Back</button>
              <button 
                onClick={handleIdentity} 
                disabled={loading || bvn.length !== 11 || nin.length !== 11}
                className="px-6 py-2.5 bg-[#0F7642] text-white rounded-xl font-medium hover:bg-[#0F7642]/90 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Continue'} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      case 'documents':
        const FileUpload = ({ label, file, setFile }: { label: string, file: File | null, setFile: (f: File | null) => void }) => (
          <div className="p-4 border border-dashed border-border rounded-xl bg-muted/20">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">{label}</label>
              {file && <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Selected</span>}
            </div>
            <div className="relative">
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UploadCloud className="w-4 h-4" />
                <span>{file ? file.name : 'Click to upload or drag & drop'}</span>
              </div>
            </div>
          </div>
        );

        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold">Upload Documents</h3>
              <p className="text-sm text-muted-foreground mt-1">Provide the required ID cards and selfies.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto p-1">
              <FileUpload label="Passport Photo" file={passport} setFile={setPassport} />
              <FileUpload label="Work ID" file={workId} setFile={setWorkId} />
              <FileUpload label="Signature" file={signature} setFile={setSignature} />
              <FileUpload label="BVN Selfie" file={bvnSelfie} setFile={setBvnSelfie} />
              <FileUpload label="NIN Selfie" file={ninSelfie} setFile={setNinSelfie} />
              <FileUpload label="Live Selfie" file={liveSelfie} setFile={setLiveSelfie} />
            </div>
            <div className="flex justify-between pt-4">
              <button onClick={() => setStep('identity')} className="px-6 py-2.5 bg-muted text-muted-foreground rounded-xl font-medium hover:bg-muted/80">Back</button>
              <button 
                onClick={handleDocuments} 
                disabled={loading}
                className="px-6 py-2.5 bg-[#0F7642] text-white rounded-xl font-medium hover:bg-[#0F7642]/90 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Uploading...' : 'Continue'} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      case 'facematch':
        return (
          <div className="space-y-6 text-center py-8">
            <div className="w-16 h-16 bg-[#0F7642]/10 text-[#0F7642] rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold">Run Face Match</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              This will analyze the uploaded selfies against the BVN and NIN records to verify identity.
            </p>
            <div className="flex justify-center pt-8">
              <button 
                onClick={handleFaceMatch} 
                disabled={loading}
                className="px-8 py-3 bg-[#0F7642] text-white rounded-xl font-medium hover:bg-[#0F7642]/90 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : 'Run Face Match'}
              </button>
            </div>
          </div>
        );
      case 'success':
        return (
          <div className="space-y-6 text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold">Onboarding Complete</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              The public sector client has been successfully onboarded and their identity has been verified.
            </p>
            <div className="flex justify-center pt-8">
              <button 
                onClick={handleClose} 
                className="px-8 py-3 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80"
              >
                Close
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-2xl p-0 bg-card rounded-3xl overflow-hidden border-border/50">
        <div className="flex justify-between items-center p-6 border-b border-border/50">
          <h2 className="text-lg font-semibold text-foreground">Manual Client Onboarding</h2>
        </div>
        
        <div className="flex">
          {/* Steps Sidebar */}
          <div className="w-48 bg-muted/20 p-6 hidden sm:block border-r border-border/50">
            <div className="space-y-6">
              {[
                { id: 'ippis', label: 'IPPIS Lookup' },
                { id: 'identity', label: 'Identity' },
                { id: 'documents', label: 'Documents' },
                { id: 'facematch', label: 'Face Match' }
              ].map((s, i) => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border ${
                    step === s.id ? 'bg-[#0F7642] text-white border-[#0F7642]' :
                    ['identity', 'documents', 'facematch', 'success'].indexOf(step) > i 
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      : 'bg-background text-muted-foreground border-border'
                  }`}>
                    {['identity', 'documents', 'facematch', 'success'].indexOf(step) > i ? <CheckCircle2 className="w-4 h-4"/> : (i + 1)}
                  </div>
                  <span className={`text-sm ${step === s.id ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 p-8">
            {renderStep()}
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
